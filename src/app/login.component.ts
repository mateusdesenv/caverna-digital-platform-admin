import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  email = '';
  password = '';

  async submit(): Promise<void> {
    this.error.set('');

    if (!this.email.includes('@') || this.password.length < 8) {
      this.error.set('Informe um e-mail válido e uma senha com pelo menos 8 caracteres.');
      return;
    }

    this.loading.set(true);

    try {
      await this.auth.login(this.email, this.password);
      await this.router.navigate(['/admin/dashboard']);
    } catch {
      this.error.set('Acesso interno não autorizado. Verifique suas credenciais e permissões.');
    } finally {
      this.loading.set(false);
    }
  }
}
