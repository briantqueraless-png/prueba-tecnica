import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('password_resets')
export class PasswordReset {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column({ name: 'user_id', unsigned: true })
  userId!: number;

  @Column({ length: 255, unique: true })
  token!: string;

  @Column({ name: 'expires_at' })
  expiresAt!: Date;

  @Column({ default: 0 })
  used!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.passwordResets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}