import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({
    example: '제목',
    description: '게시글의 제목',
  })
  @IsString({
    message: '문자열을 입력해주세요.',
  })
  @IsNotEmpty({
    message: '빈 문자열은 입력할 수 없습니다.',
  })
  title: string;

  @ApiProperty({
    example: '내용',
    description: '게시글의 내용',
  })
  @IsString({
    message: '문자열을 입력해주세요.',
  })
  @IsNotEmpty({
    message: '빈 문자열은 입력할 수 없습니다.',
  })
  content: string;
}
