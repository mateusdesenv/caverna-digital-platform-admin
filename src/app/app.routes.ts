import { Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { MasterPageComponent } from './master-page.component';
import { MasterShellComponent } from './master-shell.component';
import { authGuard, loginGuard, roleGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  {
    path: 'admin',
    component: MasterShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: MasterPageComponent, data: { page: 'dashboard' } },
      { path: 'clientes', component: MasterPageComponent, data: { page: 'clients' } },
      { path: 'clientes/:id', component: MasterPageComponent, data: { page: 'client-detail' } },
      { path: 'usuarios', component: MasterPageComponent, data: { page: 'users' } },
      {
        path: 'assinaturas',
        component: MasterPageComponent,
        canActivate: [roleGuard],
        data: { page: 'subscriptions', roles: ['super_admin', 'admin', 'finance'] },
      },
      {
        path: 'planos',
        component: MasterPageComponent,
        canActivate: [roleGuard],
        data: { page: 'plans', roles: ['super_admin', 'admin', 'finance'] },
      },
      { path: 'metricas', component: MasterPageComponent, data: { page: 'metrics' } },
      {
        path: 'configuracoes',
        component: MasterPageComponent,
        canActivate: [roleGuard],
        data: { page: 'settings', roles: ['super_admin', 'admin'] },
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'admin/dashboard' },
  { path: '**', redirectTo: 'admin/dashboard' },
];
