import BookCard from "@/components/BookCard/BookCard";
import {
  getLatestBooks,
  getMostPopularBooks,
  getRandomBooks,
} from "@/lib/actions/book.action";
import { auth } from "@/auth.config";
import Carousel from "./Carousel";

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  userBookId?: number | null;
  status?: "READ" | "READING" | "NOT_READ" | null;
}

export default async function BookLists() {
  const session = await auth();
  const token = session?.accessToken ?? null;
  const userId = session?.user ? Number(session.user.id) : undefined;

  const [resRandom, resPopular, resLatest] = await Promise.all([
    getRandomBooks(token),
    getMostPopularBooks(token),
    getLatestBooks(token),
  ]);

  const randomBooks: Book[] = resRandom.success ? resRandom.data : [];
  const popularBooks: Book[] = resPopular.success ? resPopular.data : [];
  const latestBooks: Book[] = resLatest.success ? resLatest.data : [];

  return (
    <>
      <section className="border-b border-b-gray-200 mt-2 mb-6">
        <h2 className="title-section mt-2 inline-flex items-center">
          <span className="relative">
            Découvertes
            <span className="absolute -bottom-2 left-0 h-1 w-12 rounded-full bg-quater/30" />
          </span>
        </h2>
        <Carousel>
          {randomBooks.map((book) => (
            <div key={book.id} className="snap-start shrink-0">
              <BookCard
                book={book}
                userId={userId}
                token={token}
                userBookId={book.userBookId ?? null}
                status={book.status ?? null}
              />
            </div>
          ))}
        </Carousel>
      </section>

      {/* <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-4 pb-4 mb-8 pt-3 px-1 no-scrollbar">
        {randomBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            userId={userId ?? 0}
            token={token}
            userBookId={book.userBookId ?? null}
            status={book.status ?? null}
          />
        ))}
      </div> */}
      <section className="border-b border-b-gray-200 mt-2 mb-6">
        <h2 className="title-section inline-flex items-center">
          <span className="relative">
            Populaires
            <span className="absolute -bottom-2 left-0 h-1 w-12 rounded-full bg-quater/30" />
          </span>
        </h2>
        <Carousel>
          {popularBooks.map((book) => (
            <div key={book.id} className="snap-start shrink-0">
              <BookCard
                book={book}
                userId={userId}
                token={token}
                userBookId={book.userBookId ?? null}
                status={book.status ?? null}
              />
            </div>
          ))}
        </Carousel>
      </section>

      <section className="mb-18">
        <h2 className="title-section inline-flex items-center">
          <span className="relative">
            Nouveautés
            <span className="absolute -bottom-2 left-0 h-1 w-12 rounded-full bg-quater/30" />
          </span>
        </h2>
        <Carousel>
          {latestBooks.map((book) => (
            <div key={book.id} className="snap-start shrink-0">
              <BookCard
                book={book}
                userId={userId}
                token={token}
                userBookId={book.userBookId ?? null}
                status={book.status ?? null}
              />
            </div>
          ))}
        </Carousel>
      </section>
    </>
  );
}
