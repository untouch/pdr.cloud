import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserCreate, UserResponse } from '@pdr.cloud/libs';

/* Controller für alle User-Endpunkte unter /users */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /* GET /users - Gibt alle User aus der users.json zurück */
  @Get()
  async findAll(): Promise<UserResponse[]> {
    return this.usersService.findAll();
  }

  /* GET /users/:id - Gibt einzelnen User anhand ID zurück oder wirft NotFoundException */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponse> {
    return this.usersService.findOne(id);
  }

  /* POST /users - Erstellt neuen User mit Zod-Validierung und persistiert in users.json */
  @Post()
  async create(@Body() createData: UserCreate): Promise<UserResponse> {
    return this.usersService.create(createData);
  }
}
