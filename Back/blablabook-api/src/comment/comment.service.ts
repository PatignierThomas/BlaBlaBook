import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentStatusEnum } from 'generated/prisma';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async getCommentsToModerate(page: number = 0, limit: number = 10) {
    const skip = page * limit;
    const take = limit;
    const comments = await this.prisma.comment.findMany({
      skip,
      take,
      where: {
        status: CommentStatusEnum.ACTIVE,
        reports: {
          some: {},
        },
      },
      include: {
        _count: {
          select: { reports: true },
        },
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
            email: true,
          },
        },
        book: {
          select: { id: true, title: true, author: true },
        },
      },
    });
    return comments.filter((comment) => comment._count.reports >= 5);
  }

  async getCommentCount() {
    const result = await this.prisma.comment.count();
    return { count: result };
  }

  async getReportedCommentCount() {
    const result = await this.prisma.$queryRaw<[{ count: number }]>`
      SELECT COUNT(DISTINCT c.id)::int as count
      FROM comment c
      INNER JOIN "commentReport" cr ON c.id = cr."commentId"
      GROUP BY c.id
      HAVING COUNT(cr.id) >= 5 AND c.status = 'ACTIVE'
    `;
    return { count: result[0]?.count || 0 };
  }

  async findAll(skip: number, take: number) {
    const [data] = await Promise.all([
      this.prisma.comment.findMany({
        skip,
        take,
        where: {
          status: {
            in: [CommentStatusEnum.ACTIVE, CommentStatusEnum.APPROVED],
          },
        },
      }),
    ]);
    return { data };
  }

  async createComment(userId: number, dto: CreateCommentDto) {
    const book = await this.prisma.book.findUnique({
      where: { id: dto.bookId },
      select: { id: true },
    });

    if (!book) throw new NotFoundException('Livre introuvable');

    return this.prisma.comment.create({
      data: {
        title: dto.title,
        content: dto.content,
        status: CommentStatusEnum.ACTIVE,
        date: new Date(),

        user: { connect: { id: userId } },
        book: { connect: { id: dto.bookId } },
      },
      include: {
        user: { select: { id: true, username: true, profilePicture: true } },
        book: { select: { id: true, title: true, author: true, cover: true } },
      },
    });
  }

  async reportComment(commentId: number, userId: number) {
    const exists = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, status: true },
    });
    if (!exists) throw new NotFoundException('Commentaire introuvable');

    try {
      await this.prisma.$transaction([
        this.prisma.commentReport.create({
          data: { commentId, userId },
        }),
      ]);

      return { ok: true };
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if ((e as any)?.code === 'P2002') {
        throw new ConflictException('Déjà signalé');
      }
      throw e;
    }
  }

  async approveComment(commentId: number) {
    const exists = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, status: true },
    });
    if (!exists) throw new NotFoundException('Commentaire introuvable');
    return this.prisma.comment.update({
      where: { id: commentId },
      data: { status: CommentStatusEnum.APPROVED },
    });
  }

  async rejectComment(commentId: number) {
    const exists = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, status: true },
    });
    if (!exists) throw new NotFoundException('Commentaire introuvable');
    return this.prisma.comment.update({
      where: { id: commentId },
      data: { status: CommentStatusEnum.HIDDEN },
    });
  }

  async latestCommentPerBook(take = 10) {
    return this.prisma.comment.findMany({
      where: {
        status: { in: [CommentStatusEnum.ACTIVE, CommentStatusEnum.APPROVED] },
      },
      orderBy: {
        date: 'desc',
      },
      distinct: ['bookId'],
      take,
      include: {
        book: true,
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
          },
        },
      },
    });
  }

  async numbeOfCommentsPerBook(take = 10) {
    const groupedComments = await this.prisma.comment.groupBy({
      by: ['bookId'],
      where: {
        status: { in: [CommentStatusEnum.ACTIVE, CommentStatusEnum.APPROVED] },
      },
      _count: {
        bookId: true,
      },
      orderBy: {
        _count: {
          bookId: 'desc',
        },
      },
      take,
    });
    return groupedComments;
  }
}
