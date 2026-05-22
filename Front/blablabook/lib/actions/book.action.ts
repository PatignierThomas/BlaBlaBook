"use server";

const url = process.env.NEXT_PUBLIC_API_URL ?? "http://api:3000";

export const getRandomBooks = async (token?: string | null) => {
  const res = await fetch(`${url}/books/fetch-random`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
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

  const resData = await res.json();

  return {
    success: true,
    data: resData,
  };
};

export const getMostPopularBooks = async (token?: string | null) => {
  const res = await fetch(`${url}/books/fetch-popular-books`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

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

  const resData = await res.json();

  return {
    success: true,
    data: resData,
  };
};

export const getLatestBooks = async (token?: string | null) => {
  const res = await fetch(`${url}/books/fetch-latest`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

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

  const resData = await res.json();

  return {
    success: true,
    data: resData,
  };
};

//! RÉCUPÉRER UN LIVRE PAR SON ID
export const getBookById = async (bookId: number) => {
  const res = await fetch(`${url}/books/${bookId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    return {
      success: false,
      error:
        errorData.message ||
        "Un problème est survenu lors de la récupération du livre",
      status: res.status,
    };
  }
  const resData = await res.json();

  return {
    success: true,
    data: resData,
  };
};
