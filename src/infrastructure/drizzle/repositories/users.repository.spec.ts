import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { users } from '../schemas/users.schema';
import { DRIZZLE_CONNECTION } from '../drizzle.constants';

describe('UsersRepository', () => {
  let repository: UsersRepository;

  const mockDb = {
    select: jest.fn(),
    insert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        { provide: DRIZZLE_CONNECTION, useValue: mockDb },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [{ id: 1, username: 'user1' }];
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockResolvedValueOnce(expectedUsers),
      });

      const result = await repository.findAll();

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('findByUsername', () => {
    it('should return a user when found', async () => {
      const expectedUser = { id: 1, username: 'user1' };
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockResolvedValueOnce([expectedUser]),
        }),
      });

      const result = await repository.findByUsername('user1');

      expect(result).toEqual(expectedUser);
    });

    it('should return null when no user found', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockResolvedValueOnce([]),
        }),
      });

      const result = await repository.findByUsername('unknown');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should insert and return the created user', async () => {
      const newUser = { username: 'newuser', passwordHash: 'hash', fullName: 'New User' };
      const createdUser = { id: 1, ...newUser };

      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([createdUser]),
        }),
      });

      const result = await repository.create(newUser);

      expect(result).toEqual(createdUser);
      expect(mockDb.insert).toHaveBeenCalledWith(users);
    });
  });
});
