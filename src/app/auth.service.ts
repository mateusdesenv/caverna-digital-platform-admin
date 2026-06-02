import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse, MasterUser } from './master.models';

interface LoginResponse {
  token: string;
  user: MasterUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenKey = 'caverna_digital_master_token';
  private readonly userKey = 'caverna_digital_master_user';
  private readonly userState = signal<MasterUser | null>(this.readStoredUser());

  readonly user = this.userState.asReadonly();

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return Boolean(this.token && this.userState());
  }

  hasAnyRole(roles: string[]): boolean {
    const role = this.userState()?.role;
    return Boolean(role && roles.includes(role));
  }

  async login(email: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/master/auth/login`, { email, password }),
    );

    localStorage.setItem(this.tokenKey, response.data.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.data.user));
    this.userState.set(response.data.user);
  }

  async refreshMe(): Promise<void> {
    if (!this.token) return;

    const response = await firstValueFrom(this.http.get<ApiResponse<MasterUser>>(`${environment.apiUrl}/master/auth/me`));
    localStorage.setItem(this.userKey, JSON.stringify(response.data));
    this.userState.set(response.data);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userState.set(null);
    void this.router.navigate(['/login']);
  }

  private readStoredUser(): MasterUser | null {
    const rawUser = localStorage.getItem(this.userKey);
    if (!rawUser) return null;

    try {
      return JSON.parse(rawUser) as MasterUser;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem('caverna_digital_master_token');

  if (!token) return next(request);

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
