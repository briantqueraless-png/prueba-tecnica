import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(email: string, password: string) {
    const exists = await this.usersService.findByEmail(email);
    if (exists) throw new BadRequestException('El correo ya está registrado');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.createUser(email, hashed);

    return { message: 'Usuario registrado correctamente', userId: user.id };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Credenciales inválidas');

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return { access_token: token, email: user.email };
  }

  async recoverPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return { message: 'Si el correo existe, recibirás un enlace' };

    const token = randomBytes(32).toString('hex');
    await this.usersService.saveResetToken(user.id, token);
    await this.sendRecoveryEmail(email, token);

    return { message: 'Si el correo existe, recibirás un enlace' };
  }

  async resetPassword(token: string, newPassword: string) {
    const reset = await this.usersService.findValidToken(token);
    if (!reset) throw new UnauthorizedException('Token inválido o expirado');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(reset.userId, hashed);
    await this.usersService.markTokenUsed(reset.id);

    return { message: 'Contraseña actualizada correctamente' };
  }

  private async sendRecoveryEmail(email: string, token: string) {
    const transporter = nodemailer.createTransport({
      host: this.config.get('MAIL_HOST'),
      port: this.config.get<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.config.get('MAIL_USER'),
        pass: this.config.get('MAIL_PASS'),
      },
    });

    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

    await transporter.sendMail({
      from: this.config.get('MAIL_FROM'),
      to: email,
      subject: 'Recuperación de contraseña',
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña.</p>
        <p>El enlace expira en <strong>1 hora</strong>.</p>
        <a href="${resetUrl}">Restablecer contraseña</a>
        <p>Si no solicitaste esto, ignora este correo.</p>
      `,
    });
  }
}