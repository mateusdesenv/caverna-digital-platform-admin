import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly error = signal('');

  async loginWithGoogle(): Promise<void> {
    this.error.set('');
    this.loading.set(true);

    try {
      await this.auth.loginWithGoogle();
      await this.router.navigate(['/admin/dashboard']);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível autenticar com Google.';
      this.error.set(message);
      this.snackBar.open(message, 'Fechar', {
        duration: 4200,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
    } finally {
      this.loading.set(false);
    }
  }
}
