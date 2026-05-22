import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ForbiddenException,
  Req,
  Query,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import express from 'express';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SelfOrAdminGuard } from 'src/auth/guards/selfOrAdmin.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { OptionalAuthGuard } from 'src/auth/guards/optional-auth.guard';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateUserFormDataDTO } from './dto/update-user-form-data.dto';
import { RoleId } from 'src/types/role.enum';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //! GET ALL USERS
  @Get()
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  async findAll(
    @Query('page') page: string = '0',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    const skip = Number(page) * Number(limit);
    const take = Number(limit);
    const { data, total } = await this.usersService.findAll(skip, take, search);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const usersWithoutPassWword = data.map(({ password, ...user }) => user);
    return { data: usersWithoutPassWword, total };
  }

  @Get('user-count')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  async getUserCount() {
    return this.usersService.getUserCount();
  }

  //! GET PROFILE USER
  @Get('/profil/:id')
  @ApiBearerAuth()
  @UseGuards(OptionalAuthGuard)
  async getprofileById(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: express.Request,
  ) {
    const requestingUserId = request.user?.id;
    const result = await this.usersService.getProfileById(id, requestingUserId);

    if ('error' in result) {
      if (result.error === 'NOT_FOUND') {
        throw new NotFoundException('Utilisateur non trouvé');
      } else if (result.error === 'PRIVATE') {
        throw new ForbiddenException('Ce profil est privé');
      }
    }
    return result.user;
  }

  //! GET USER BY ID
  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: express.Request,
  ) {
    const user = await this.usersService.findById(id, request.user?.id);
    return user;
  }

  //! UPDATE USER BY ID
  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(SelfOrAdminGuard)
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: diskStorage({
        destination: './uploads/profiles',
        filename: (
          _req: Express.Request,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (
        _req: Express.Request,
        file: Express.Multer.File,
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(
            new BadRequestException('Seules les images sont autorisées'),
            false,
          );
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  @ApiUnauthorizedResponse({
    description:
      "Jeton d'autorisation manquant (ou invalide) dans l'entête de la requête",
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
    @Req() request: express.Request,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const dto = plainToInstance(UpdateUserFormDataDTO, data);
    const errors = await validate(dto);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
    if ((request.user?.roleId as RoleId) !== RoleId.ADMIN && 'roleId' in dto) {
      throw new ForbiddenException(
        "Accès refusé : vous n'avez pas la permission de modifier le rôle de l'utilisateur",
      );
    }
    if (file) {
      dto.profilePicture = `/uploads/profiles/${file.filename}`;
    }

    if (typeof dto.isPrivate === 'string') {
      dto.isPrivate = dto.isPrivate === 'true';
    }

    return this.usersService.update(id, dto);
  }

  //! UPDATE USER ROLE
  @Patch(':id/role')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @ApiUnauthorizedResponse({
    description:
      "Jeton d'autorisation manquant (ou invalide dans l'entête de la requête",
  })
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.usersService.updateUserRole(id, { roleId });
  }

  //! DELETE USER BY ID
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(SelfOrAdminGuard)
  @ApiUnauthorizedResponse({
    description:
      "Jeton d'autorisation manquant (ou invalide) dans l'entête de la requête",
  })
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
