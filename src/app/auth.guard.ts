import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

export function authGuard(): boolean | UrlTree {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
}

export function loginGuard(): boolean | UrlTree {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? router.createUrlTree(['/admin/dashboard']) : true;
}

export function roleGuard(route: ActivatedRouteSnapshot): boolean | UrlTree {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = route.data['roles'] as string[] | undefined;

  if (!roles?.length) return true;
  return auth.hasAnyRole(roles) ? true : router.createUrlTree(['/admin/dashboard']);
}
