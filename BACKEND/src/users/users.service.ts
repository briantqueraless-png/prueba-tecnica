import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { PasswordReset } from './entities/password-reset.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,

    @InjectRepository(PasswordReset)
    private passwordResetRepo: Repository<PasswordReset>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async createUser(email: string, hashedPassword: string): Promise<User> {
    const user = this.usersRepo.create({ email, password: hashedPassword });
    return this.usersRepo.save(user);
  }

  async saveResetToken(userId: number, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const reset = this.passwordResetRepo.create({ userId, token, expiresAt });
    await this.passwordResetRepo.save(reset);
  }

  async findValidToken(token: string): Promise<PasswordReset | null> {
    return this.passwordResetRepo
      .createQueryBuilder('pr')
      .where('pr.token = :token', { token })
      .andWhere('pr.used = 0')
      .andWhere('pr.expires_at > NOW()')
      .getOne();
  }

  async markTokenUsed(id: number): Promise<void> {
    await this.passwordResetRepo.update(id, { used: 1 });
  }

  async updatePassword(userId: number, hashedPassword: string): Promise<void> {
    await this.usersRepo.update(userId, { password: hashedPassword });
  }
}