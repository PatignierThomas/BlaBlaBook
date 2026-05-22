"use server";

type BooksResponse = {
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

interface Book {
  id: number;
  title: string;
  page_count: number;
  author: string;
  publishing_date: Date | null;
  summary: string | null;
  publisher: string | null;
  isbn: string | null;
  cover: string | null;
  averageRating: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OpenLibraryDoc {
  key?: string;
  title?: string;
  editions: Editions;
  edition_key?: string[];
  number_of_pages_median?: number;
  author_name?: string[];
  first_publish_year?: number;
  publish_date?: string[];
  publisher?: string[];
  isbn?: string[];
  cover_i?: number;
}

interface Editions {
  numFound: number;
  start: number;
  numFoundExact: number;
  docs: EditionsDocs[];
}

interface EditionsDocs {
  key: string;
  title: string;
  cover_i: number;
  isbn: string[];
}

interface mostCommentedBooksResponse extends BooksResponse {
  commentCount: number;
}

interface mostAddedBooksResponse extends BooksResponse {
  addedCount: number;
}

const url = process.env.NEXT_PUBLIC_API_URL ?? "http://api:3000";

export const searchBooksAction = async (
  query: string,
  token?: string | null,
  page: number = 1,
  size: number = 10,
) => {
  const res = await fetch(
    `${url}/books/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );
  if (!res.ok) {
    const errorData = await res.json();
    return {
      success: false,
      error:
        errorData.message ||
        "Un problème est survenu lors de la recherche des livres",
      status: res.status,
    };
  }
  const resData: BooksResponse[] = await res.json();
  return {
    success: true,
    data: resData,
  };
};

export const searchBooksFromExternalApiAction = async (
  query: string,
  limit: number = 20,
) => {
  if (query.trim().length < 3) {
    return {
      success: false,
      error: "La recherche doit contenir au moins 3 caractères.",
      status: 400,
    };
  }
  const res = await fetch(
    `${url}/books/search-external?q=${encodeURIComponent(query)}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!res.ok) {
    const errorData = await res.json();
    return {
      success: false,
      error:
        errorData.message ||
        "Un problème est survenu lors de la recherche des livres externes",
      status: res.status,
    };
  }
  const resData: OpenLibraryDoc[] = await res.json();
  return {
    success: true,
    data: resData,
  };
};

export const importBooksFromExternalApiAction = async (
  book: OpenLibraryDoc,
) => {
  const res = await fetch(`${url}/books/import-external`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(book),
  });
  if (!res.ok) {
    const errorData = await res.json();
    return {
      success: false,
      error:
        errorData.message ||
        "Un problème est survenu lors de l'importation du livre externe",
      status: res.status,
    };
  }
  const resData: Book = await res.json();
  return {
    success: true,
    data: resData,
  };
};

export const mostCommentedBooksAction = async (take = 9, token?: string | null) => {
  const res = await fetch(
    `${url}/books/most-commented-books?take=${take}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );
  if (!res.ok) {
    const errorData = await res.json();
    return {
      success: false,
      error:
        errorData.message ||
        "Un problème est survenu lors de la récupération des livres",
      status: res.status,
    };
  }

  const resData: mostCommentedBooksResponse[] = await res.json();
  return {
    success: true,
    data: resData,
  };
};

export const mostAddedBooksAction = async (take = 9, token?: string | null) => {
  const res = await fetch(
    `${url}/books/most-added-books?take=${take}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );
  if (!res.ok) {
    const errorData = await res.json();
    return {
      success: false,
      error:
        errorData.message ||
        "Un problème est survenu lors de la récupération des livres",
      status: res.status,
    };
  }
  const resData: mostAddedBooksResponse[] = await res.json();
  return {
    success: true,
    data: resData,
  };
};
