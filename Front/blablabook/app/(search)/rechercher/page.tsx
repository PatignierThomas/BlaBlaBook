import MostAddedBooks from "@/components/Search/MostAddedBooks";
import MostCommentedBooks from "@/components/Search/MostCommentedBooks";
import SearchBarHandler from "@/components/Search/SearchBarHandler";
import BackupSearchResults from "@/components/Search/BackupSearchResults";
import {
  searchBooksAction,
  searchBooksFromExternalApiAction,
} from "@/lib/actions/search.action";
import { auth } from "@/auth.config";
import SearchResult from "@/components/Search/SearchResult";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function Search({ searchParams }: SearchPageProps) {
  const session = await auth();
  const params = await searchParams;
  const query = params.q;
  const token = session?.accessToken ?? null;

  let searchResults = null;
  let backUpSearch = null;

  if (query) {
    searchResults = await searchBooksAction(query, token, 1, 10);
    if (
      query.trim().length >= 3 &&
      (!searchResults.success ||
        (searchResults.data && searchResults.data.length === 0))
    ) {
      backUpSearch = await searchBooksFromExternalApiAction(query, 10);
    }
  }

  const hasResults =
    searchResults &&
    searchResults.success &&
    searchResults.data &&
    searchResults.data.length > 0;

  return (
    <>
      <div className="sm:hidden">
        <SearchBarHandler />
      </div>

      {searchResults && searchResults.data && hasResults && query ? (
        <SearchResult
          initialBooks={searchResults.data}
          query={query}
          token={token}
          userId={session?.user ? Number(session.user.id) : undefined}
        />
      ) : (
        <>
          {searchResults && searchResults.success && !hasResults && (
            <>
              <p className="text-red-400 ml-5 mb-3">
                Aucun résultat trouvé pour votre recherche.
              </p>
              {backUpSearch &&
                backUpSearch.success &&
                backUpSearch.data &&
                backUpSearch.data.length > 0 && (
                  <BackupSearchResults books={backUpSearch.data} />
                )}
            </>
          )}
          <MostAddedBooks />
          <MostCommentedBooks />
        </>
      )}
    </>
  );
}
