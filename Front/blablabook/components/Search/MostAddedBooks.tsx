import BookCard from "../BookCard/BookCard";
import { mostAddedBooksAction } from "@/lib/actions/search.action";
import { auth } from "@/auth.config";

async function MostAddedBooks() {
  const session = await auth();
  const token = session?.accessToken ?? null;
  const userId = session?.user ? Number(session.user.id) : undefined;

  const mostAddedBooks = await mostAddedBooksAction(9, token);

  return (
    <div className="mb-12">
      <h2 className="title-section ml-3 text-gray-700 font-bold mb-4 px-2">
        Les plus ajoutés
      </h2>
      <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-4 pb-4 pt-3 px-1 no-scrollbar">
        {mostAddedBooks.data &&
          mostAddedBooks.data.map((book) => (
            <BookCard
              key={book.id}
              book={{
                id: book.id,
                title: book.title,
                author: book.author,
                cover: book.cover,
              }}
              userId={userId}
              token={token}
              userBookId={book.userBooks?.[0]?.id ?? null}
              status={book.userBooks?.[0]?.status ?? null}
            />
          ))}
      </div>
    </div>
  );
}

export default MostAddedBooks;
