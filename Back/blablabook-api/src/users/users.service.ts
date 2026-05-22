import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma } from 'generated/prisma/client';
import { NewUserDTO } from './dto/new-user.dto';
import * as bcrypt from 'bcryptjs';
import { UserWithRole } from './types/user.types';
import { UpdateUserFormDataDTO } from './dto/update-user-form-data.dto';
import { RoleId } from 'src/types/role.enum';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: NewUserDTO): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: data.password,
        roleId: data.roleId || RoleId.USER,
        isPrivate: data.isPrivate || false,
      },
      include: {
        role: true,
      },
    });
  }

  async findAll(skip: number, take: number, search?: string) {
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        where,
        include: {
          role: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total };
  }

  //! Find user by ID
  async findById(id: number, requestingUserId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: false,
        password: false,
        isPrivate: true,
        description: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
        roleId: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (id !== requestingUserId && user?.isPrivate) {
      throw new ForbiddenException(
        'Les informations de cet utilisateur sont privées',
      );
    }

    return user;
  }

  async getUserCount() {
    const count = await this.prisma.user.count();
    return { count };
  }

  //! Find user by ID
  async getProfileById(id: number, requestingUserId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: false,
        isPrivate: true,
        password: false,
        description: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
        userBooks: {
          include: {
            book: true,
          },
        },
        comments: true,
      },
    });

    if (!user) {
      return { error: 'NOT_FOUND' };
    }

    // Allow access if the profile is public OR if the requesting user is the profile owner
    if (user.isPrivate && requestingUserId !== id) {
      return { error: 'PRIVATE' };
    }

    return { user };
  }

  async findByIdWithRole(id: number): Promise<UserWithRole | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });
  }

  async findAuthUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        isPrivate: true,
        profilePicture: true,
        roleId: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByEmailWithRole(email: string): Promise<UserWithRole | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  //! UPDATE USER BY ID
  async update(id: number, data: UpdateUserFormDataDTO): Promise<User> {
    const updateData = { ...data };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }
    // quand on remplace la photo de profil, il faut supprimer l'ancienne
    if (data.profilePicture) {
      const currentUser = await this.prisma.user.findUnique({
        where: { id },
        select: { profilePicture: true },
      });

      if (
        currentUser?.profilePicture &&
        currentUser.profilePicture.startsWith('/uploads') &&
        currentUser.profilePicture !== data.profilePicture
      ) {
        await this.deleteFile(currentUser.profilePicture);
      }
    }
    return this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true,
      },
    });
  }

  // async updateByEmail(email: string, data: UpdateUserDTO): Promise<User> {
  //   const updateData = { ...data };

  //   if (data.password) {
  //     updateData.password = await bcrypt.hash(data.password, 12);
  //   }

  //   return this.prisma.user.update({
  //     where: { email },
  //     data: updateData,
  //     include: {
  //       role: true,
  //     },
  //   });
  // }

  async updateUserRole(id: number, data: { roleId: number }) {
    return this.prisma.user.update({
      where: { id },
      data: { roleId: data.roleId },
    });
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (user?.profilePicture) {
      await this.deleteFile(user.profilePicture);
    }
    return this.prisma.user.delete({
      where: { id },
    });
  }

  private async deleteFile(filePath: string) {
    const fullPath = join(__dirname, '..', '..', filePath);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
}
