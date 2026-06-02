import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { signInWithPopup, signOut } from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { firebaseAuth, googleProvider } from './core/firebase/firebase.config';
import { ApiResponse, MasterUser } from './master.models';

interface LoginResponse {
  token: string;
  user: MasterUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';
  private readonly allowedRoles = ['super_admin', 'admin', 'support', 'finance'];
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

  hasInternalRole(): boolean {
    const role = this.userState()?.role;
    return Boolean(role && this.allowedRoles.includes(role));
  }

  async loginWithGoogle(): Promise<void> {
    const credential = await signInWithPopup(firebaseAuth, googleProvider);
    const idToken = await credential.user.getIdToken();
    const response = await firstValueFrom(
      this.http.post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/master/auth/google`, { idToken }),
    );

    this.persistSession(response.data.user, response.data.token);
    this.ensureInternalRole();
  }

  async login(email: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/master/auth/login`, { email, password }),
    );

    this.persistSession(response.data.user, response.data.token);
    this.ensureInternalRole();
  }

  async refreshMe(): Promise<void> {
    if (!this.token) return;

    const response = await firstValueFrom(this.http.get<ApiResponse<MasterUser>>(`${environment.apiUrl}/master/auth/me`));
    localStorage.setItem(this.userKey, JSON.stringify(response.data));
    this.userState.set(response.data);
    this.ensureInternalRole();
  }

  async logout(): Promise<void> {
    await signOut(firebaseAuth).catch(() => undefined);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userState.set(null);
    void this.router.navigate(['/login']);
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userState.set(null);
  }

  private persistSession(user: MasterUser, token: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.userState.set(user);
  }

  private ensureInternalRole(): void {
    if (this.hasInternalRole()) return;

    this.clearSession();
    throw new Error('Você não tem permissão para acessar este painel.');
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
  const token = localStorage.getItem('auth_token');

  if (!token) return next(request);

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
