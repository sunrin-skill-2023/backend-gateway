import { PartialType } from '@nestjs/swagger';
import { CreateBoardDto } from './create-board';

export class UpdateBoardDto extends PartialType(CreateBoardDto) {}
