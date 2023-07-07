import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  OnModuleInit,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { ApiBearerAuth } from '@nestjs/swagger';
import { BoardServiceClient } from 'shared/src/generated/board.proto';
import { grpcClientOptions } from 'shared/src/options/board.option';
import { AccessGuard } from '../auth/guards/acess.guard';
import { CreateBoardDto } from './dto/create-board';
import { UpdateBoardDto } from './dto/update-board';

@Controller('board')
export class BoardController implements OnModuleInit {
  @Client(grpcClientOptions) private readonly client: ClientGrpc;
  private boardService: BoardServiceClient;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.boardService =
      this.client.getService<BoardServiceClient>('BoardService');
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async getBoards() {
    return this.boardService.getBoardList({});
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async getBoardById(@Param('id') id: string) {
    return this.boardService.getBoardById({
      id,
    });
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async createBoard(@Req() req: Express.Request, @Body() body: CreateBoardDto) {
    return this.boardService.createBoard({
      title: body.title,
      content: body.content,
      userId: req.user.uuid,
    });
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async updateBoard(
    @Req() req: Express.Request,
    @Body() body: UpdateBoardDto,
    @Param('id') id: string,
  ) {
    const isOnwer = await this.boardService.isBoardOwner({
      userId: req.user.uuid,
      boardId: id,
    });
    if (!isOnwer) throw new HttpException('Forbidden', 403);

    return this.boardService.updateBoard({
      id: id,
      title: body.title,
      content: body.content,
    });
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async deleteBoard(@Req() req: Express.Request, @Param('id') id: string) {
    const isOnwer = this.boardService.isBoardOwner({
      userId: req.user.uuid,
      boardId: id,
    });
    if (!isOnwer) throw new HttpException('Forbidden', 403);

    return this.boardService.deleteBoard({ id: id });
  }
}
