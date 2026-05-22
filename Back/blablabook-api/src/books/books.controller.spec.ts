import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { OptionalAuthGuard } from 'src/auth/guards/optional-auth.guard';
import type { OpenLibraryDoc } from './types/books.type';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockMappedBook = {
  id: 1,
  title: 'Le Petit Prince',
  author: 'Antoine de Saint-Exupéry',
  cover: null,
  userBookId: null,
  status: null,
};

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockBooksService = {
  getBooks: jest.fn(),
  findOne: jest.fn(),
  getRandomBooks: jest.fn(),
  getMostPopularBooks: jest.fn(),
  getLatestBooks: jest.fn(),
  mostAddedBooks: jest.fn(),
  mostCommentedBooks: jest.fn(),
  searchBooks: jest.fn(),
  searchBooksWithOpenLibraryApi: jest.fn(),
  importExternalBookToDatabase: jest.fn(),
  getBooksFromOpenLibraryApi: jest.fn(),
};

const allowAllGuard = { canActivate: () => true };

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('BooksController', () => {
  let controller: BooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [{ provide: BooksService, useValue: mockBooksService }],
    })
      .overrideGuard(OptionalAuthGuard)
      .useValue(allowAllGuard)
      .compile();

    controller = module.get<BooksController>(BooksController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('calls getBooks without userId when no query param', () => {
      mockBooksService.getBooks.mockReturnValue([mockMappedBook]);

      controller.findAll(undefined);

      expect(mockBooksService.getBooks).toHaveBeenCalledWith(undefined);
    });

    it('passes userId from authenticated request', () => {
      mockBooksService.getBooks.mockReturnValue([]);

      controller.findAll({ user: { id: 5 } });

      expect(mockBooksService.getBooks).toHaveBeenCalledWith(5);
    });
  });

  // ─── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('calls findOne with the parsed id', () => {
      mockBooksService.findOne.mockReturnValue(mockMappedBook);

      controller.findOne(1);

      expect(mockBooksService.findOne).toHaveBeenCalledWith(1);
    });
  });

  // ─── findRandomBooks ───────────────────────────────────────────────────────

  describe('findRandomBooks', () => {
    it('calls getRandomBooks with take=10 and no userId', async () => {
      mockBooksService.getRandomBooks.mockResolvedValue([]);

      await controller.findRandomBooks(undefined);

      expect(mockBooksService.getRandomBooks).toHaveBeenCalledWith(
        10,
        undefined,
      );
    });

    it('passes userId from authenticated request', async () => {
      mockBooksService.getRandomBooks.mockResolvedValue([]);

      await controller.findRandomBooks({ user: { id: 3 } });

      expect(mockBooksService.getRandomBooks).toHaveBeenCalledWith(10, 3);
    });
  });

  // ─── findMostPopularBooks ──────────────────────────────────────────────────

  describe('findMostPopularBooks', () => {
    it('calls getMostPopularBooks with take=10', async () => {
      mockBooksService.getMostPopularBooks.mockResolvedValue([]);

      await controller.findMostPopularBooks(undefined);

      expect(mockBooksService.getMostPopularBooks).toHaveBeenCalledWith(
        10,
        undefined,
      );
    });
  });

  // ─── findLatestBooks ───────────────────────────────────────────────────────

  describe('findLatestBooks', () => {
    it('calls getLatestBooks with take=10', async () => {
      mockBooksService.getLatestBooks.mockResolvedValue([]);

      await controller.findLatestBooks(undefined);

      expect(mockBooksService.getLatestBooks).toHaveBeenCalledWith(
        10,
        undefined,
      );
    });
  });

  // ─── mostAddedBooks ────────────────────────────────────────────────────────

  describe('mostAddedBooks', () => {
    it('defaults to take=10 when no query param', () => {
      mockBooksService.mostAddedBooks.mockReturnValue([]);

      controller.mostAddedBooks(undefined, undefined);

      expect(mockBooksService.mostAddedBooks).toHaveBeenCalledWith(
        10,
        undefined,
      );
    });

    it('caps take at 10', () => {
      mockBooksService.mostAddedBooks.mockReturnValue([]);

      controller.mostAddedBooks('50', undefined);

      expect(mockBooksService.mostAddedBooks).toHaveBeenCalledWith(
        10,
        undefined,
      );
    });

    it('passes a valid take value', () => {
      mockBooksService.mostAddedBooks.mockReturnValue([]);

      controller.mostAddedBooks('5', undefined);

      expect(mockBooksService.mostAddedBooks).toHaveBeenCalledWith(
        5,
        undefined,
      );
    });
  });

  // ─── mostCommentedBooks ────────────────────────────────────────────────────

  describe('mostCommentedBooks', () => {
    it('defaults to take=10', () => {
      mockBooksService.mostCommentedBooks.mockReturnValue([]);

      controller.mostCommentedBooks(undefined, undefined);

      expect(mockBooksService.mostCommentedBooks).toHaveBeenCalledWith(
        10,
        undefined,
      );
    });
  });

  // ─── searchBooks ───────────────────────────────────────────────────────────

  describe('searchBooks', () => {
    it('decodes the query and forwards pagination params', () => {
      mockBooksService.searchBooks.mockReturnValue([]);

      controller.searchBooks('le%20prince', 1, 10, { user: { id: 2 } });

      expect(mockBooksService.searchBooks).toHaveBeenCalledWith(
        'le prince',
        1,
        10,
        2,
      );
    });

    it('works without optional params', () => {
      mockBooksService.searchBooks.mockReturnValue([]);

      controller.searchBooks('tolkien', undefined, undefined, undefined);

      expect(mockBooksService.searchBooks).toHaveBeenCalledWith(
        'tolkien',
        undefined,
        undefined,
        undefined,
      );
    });
  });

  // ─── searchBooksWithOpenLibraryApi ─────────────────────────────────────────

  describe('searchBooksWithOpenLibraryApi', () => {
    it('decodes the query before forwarding', () => {
      mockBooksService.searchBooksWithOpenLibraryApi.mockReturnValue([]);

      controller.searchBooksWithOpenLibraryApi('harry%20potter', 5);

      expect(
        mockBooksService.searchBooksWithOpenLibraryApi,
      ).toHaveBeenCalledWith('harry potter', 5);
    });
  });

  // ─── importExternalBookToDatabase ─────────────────────────────────────────

  describe('importExternalBookToDatabase', () => {
    it('forwards the book body to the service', () => {
      const book = {
        title: 'Dune',
        edition_key: ['OL1M'],
      } as unknown as OpenLibraryDoc;
      mockBooksService.importExternalBookToDatabase.mockReturnValue(book);

      controller.importExternalBookToDatabase(book);

      expect(
        mockBooksService.importExternalBookToDatabase,
      ).toHaveBeenCalledWith(book);
    });
  });
});
