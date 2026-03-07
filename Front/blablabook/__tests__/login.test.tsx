import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Login from "@/components/Auth/Login";

const replaceMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
    refresh: refreshMock,
  }),
}));

jest.mock("next-auth/react", () => ({
  useSession: () => ({ update: jest.fn(), data: null, status: "unauthenticated" }),
}));

describe("Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("shows validation errors when fields are empty", async () => {
    render(<Login />);

    await userEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(
      await screen.findByText("Veuillez entrer une adresse email valide"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Le mot de passe est obligatoire"),
    ).toBeInTheDocument();
  });

  it("shows an error toast when credentials are invalid", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Identifiants invalides" }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<Login />);

    await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
    await userEvent.type(screen.getByLabelText("Mot de passe"), "badpass");

    await userEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Identifiants invalides",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("redirects on successful login", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({
      advanceTimers: (ms) => jest.advanceTimersByTime(ms),
    });
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<Login />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Mot de passe"), "GoodPass123!");

    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Connexion réussie !",
    );

    await act(async () => {
      await jest.runOnlyPendingTimersAsync();
    });

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/mon-profil");
      expect(refreshMock).toHaveBeenCalled();
    });
  });
});
