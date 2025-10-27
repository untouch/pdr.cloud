import { Injectable, OnModuleInit, NotFoundException, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { userCreateSchema, UserResponse, UserCreate } from '@pdr.cloud/libs';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);
  private users: UserResponse[] = []; // In-Memory Array aller User aus users.json
  private nextId = 1; // Nächste verfügbare User-ID für create
  private fileLocker: Promise<void> = Promise.resolve(); // Promise-Chain zur Vermeidung vom Schreiben von Einträgen mit bereits vorhandenen IDs

  async onModuleInit() {
    await this.loadUsers();
  }

  /* Liest users.json und initialisiert users Array sowie nextId */
  private async loadUsers() {
    const dataPath = join(__dirname, 'data', 'users.json');
    try {
      const data = await fs.readFile(dataPath, 'utf-8');
      const rawData = JSON.parse(data);
      this.users = rawData.map((u: any) => ({
        id: typeof u.id === 'string' ? parseInt(u.id, 10) : u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phoneNumber: u.phoneNumber,
        birthDate: u.birthDate,
        role: u.role,
      }));
      this.nextId = Math.max(...this.users.map(u => u.id)) + 1;
    } catch (error) {
      this.users = [];
      this.nextId = 1;
    }
  }

  /* Gibt alle User zurück */
  async findAll(): Promise<UserResponse[]> {
    return this.users;
  }

  /**
   * Sucht User anhand ID oder wirft Exception
   * @param id - UserID zum Suchen
   * @returns UserTyp mit allen Daten
   * @throws NotFoundException wenn User nicht gefunden
   */
  async findOne(id: number): Promise<UserResponse> {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundException(`User mit ID ${id} nicht gefunden`);
    }
    return user;
  }

  /**
   * Validiert mit Zod Schema, erstellt User und schreibt in users.json
   * @param createData - VOn Typ UserCreate
   * @returns Erstellter User mit inkrementeller ID
   * @throws HttpException bei Validierungsfehlern
   */
  async create(createData: UserCreate): Promise<UserResponse> {
    const validation = userCreateSchema.safeParse(createData);
    if (!validation.success) {
      throw new HttpException(validation.error.errors, HttpStatus.BAD_REQUEST);
    }

    const newUser: UserResponse = {
      id: this.nextId,
      ...validation.data,
    };

    this.users.push(newUser);
    await this.persistToFile();
    this.nextId++;

    return newUser;
  }

  /* Schreibt users Array in users.json mit Queue zur Vermeidung paralleler Writes */
  private async persistToFile() {
    this.fileLocker = this.fileLocker.then(async () => {
      const dataDir = join(__dirname, 'data');
      const dataPath = join(dataDir, 'users.json');

      try {
        await fs.mkdir(dataDir, { recursive: true });
        await fs.writeFile(dataPath, JSON.stringify(this.users), 'utf-8');
      } catch (error) {
        this.logger.error('Fehler beim Schreiben der users.json', error);
      }
    });

    await this.fileLocker;
  }
}
