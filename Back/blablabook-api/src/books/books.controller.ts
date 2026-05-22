// import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BooksService } from './books.service';
import type { OpenLibraryDoc } from './types/books.type';
import { ApiBearerAuth } from '@nestjs/swagger';
import { OptionalAuthGuard } from 'src/auth/guards/optional-auth.guard';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // @Post('import')
  // async create() {
  //   await this.booksService.getBooksFromGoogleApi();
  //   return { message: 'ça marche' };
  // }

  // @Post('import')
  // async create() {
  //   await this.booksService.getBooksFromOpenLibraryApi();
  //   return { message: 'ça marche avec Open Library' };
  // }

  @Get('fetch-random')
  @ApiBearerAuth()
  @UseGuards(OptionalAuthGuard)
  async findRandomBooks(@Request() req?: { user?: { id: number } }) {
    return this.booksService.getRandomBooks(10, req?.user?.id);
  }

  @Get('fetch-popular-books')
  @ApiBearerAuth()
  @UseGuards(OptionalAuthGuard)
  async findMostPopularBooks(@Request() req?: { user?: { id: number } }) {
    return this.booksService.getMostPopularBooks(10, req?.user?.id);
  }

  @Get('fetch-latest')
  @ApiBearerAuth()
  @UseGuards(OptionalAuthGuard)
  async findLatestBooks(@Request() req?: { user?: { id: number } }) {
    return this.booksService.getLatestBooks(10, req?.user?.id);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(OptionalAuthGuard)
  findAll(@Request() req?: { user?: { id: number } }) {
    return this.booksService.getBooks(req?.user?.id);
  }

  @Get('most-added-books')
  @ApiBearerAuth()
  @UseGuards(OptionalAuthGuard)
  mostAddedBooks(
    @Query('take') take?: string,
    @Request() req?: { user?: { id: number } },
  ) {
    const n = take ? Number(take) : 10;
    return this.booksService.mostAddedBooks(
      Number.isFinite(n) ? Math.min(n, 10) : 10,
      req?.user?.id,
    );
  }

  @Get('most-commented-books')
  @ApiBearerAuth()
  @UseGuards(OptionalAuthGuard)
  mostCommentedBooks(
    @Query('take') take?: string,
    @Request() req?: { user?: { id: number } },
  ) {
    const n = take ? Number(take) : 10;
    return this.booksService.mostCommentedBooks(
      Number.isFinite(n) ? Math.min(n, 10) : 10,
      req?.user?.id,
    );
  }

  @Get('search')
  @ApiBearerAuth()
  @UseGuards(OptionalAuthGuard)
  searchBooks(
    @Query('q') query: string,
    @Query('page', new ParseIntPipe({ optional: true })) pageNumber?: number,
    @Query('size', new ParseIntPipe({ optional: true })) pageSize?: number,
    @Request() req?: { user?: { id: number } },
  ) {
    const userId = req?.user?.id;
    return this.booksService.searchBooks(
      decodeURIComponent(query),
      pageNumber,
      pageSize,
      userId,
    );
  }

  @Get('search-external')
  searchBooksWithOpenLibraryApi(
    @Query('q') query: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.booksService.searchBooksWithOpenLibraryApi(
      decodeURIComponent(query),
      limit,
    );
  }

  @Post('import-external')
  importExternalBookToDatabase(@Body() book: OpenLibraryDoc) {
    return this.booksService.importExternalBookToDatabase(book);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
  //   return this.booksService.update(+id, updateBookDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.booksService.remove(+id);
  // }
}
