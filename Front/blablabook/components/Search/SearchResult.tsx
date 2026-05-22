"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import SearchResultCard from "./SearchResultCard";
import { searchBooksAction } from "@/lib/actions/search.action";

type Book = {
	id: number;
	title: string;
	page_count: number;
	author: string;
	publishing_date: Date;
	summary: string;
	publisher: string;
	isbn: string;
	cover: string;
	averageRating: number;
	createdAt: Date;
	updatedAt: Date;
	userBooks?: {
		id: number;
		status: "READ" | "READING" | "NOT_READ";
		createdAt: Date;
		updatedAt: Date;
		userId: number;
		bookId: number;
	}[];
};

type Props = {
	initialBooks: Book[];
	query: string;
	token: string | null;
	userId?: number;
};

export default function SearchResult({
	initialBooks,
	query,
	token,
	userId,
}: Props) {
	const [books, setBooks] = useState<Book[]>(initialBooks);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const observerTarget = useRef<HTMLDivElement>(null);

	const loadMore = useCallback(async () => {
		if (loading || !hasMore) return;

		setLoading(true);
		try {
			const nextPage = page + 1;
			const result = await searchBooksAction(query, token, nextPage, 10);

			if (result.success && result.data) {
				if (result.data.length === 0) {
					setHasMore(false);
				} else {
					setBooks((prevBooks) => [...prevBooks, ...result.data]);
					setPage(nextPage);
				}
			} else {
				setHasMore(false);
			}
		} catch (error) {
			console.error("Error loading more books:", error);
			setHasMore(false);
		} finally {
			setLoading(false);
		}
	}, [loading, hasMore, page, query, token]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !loading) {
					loadMore();
				}
			},
			{ threshold: 0.1 },
		);

		const currentTarget = observerTarget.current;
		if (currentTarget) {
			observer.observe(currentTarget);
		}

		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget);
			}
		};
	}, [loadMore, hasMore, loading]);

	return (
    <div className="wrapper">
      <div className="mx-auto sm:py-14 space-y-6">
        <header className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">
            Résultats de la recherche pour &quot;{query}&quot;
          </h1>
        </header>{" "}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr m-">
          {books.map((book) => (
            <SearchResultCard
              key={book.id}
              book={book}
              token={token}
              userId={userId}
            />
          ))}
        </div>
        <div
          ref={observerTarget}
          className="h-20 flex items-center justify-center"
        >
          {loading && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Chargement...</span>
            </div>
          )}
          {!hasMore && books.length > 0 && (
            <span className="text-gray-500">Aucun résultat supplémentaire</span>
          )}
        </div>
      </div>
    </div>
	);
}
