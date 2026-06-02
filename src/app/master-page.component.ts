import { DatePipe, DecimalPipe, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { combineLatest } from 'rxjs';
import { AuthService } from './auth.service';
import { MasterApiService } from './master-api.service';
import {
  ClientAccount,
  ClientDetail,
  DashboardMetrics,
  PlanRecord,
  PlatformUser,
  SubscriptionRecord,
} from './master.models';

type PageKey = 'dashboard' | 'clients' | 'client-detail' | 'users' | 'subscriptions' | 'plans' | 'metrics' | 'settings';

@Component({
  selector: 'app-master-page',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './master-page.component.html',
  styleUrl: './master-page.component.scss',
})
export class MasterPageComponent {
  private readonly api = inject(MasterApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);
  readonly auth = inject(AuthService);

  readonly page = signal<PageKey>('dashboard');
  readonly loading = signal(true);
  readonly error = signal('');
  readonly dashboard = signal<DashboardMetrics | null>(null);
  readonly clients = signal<ClientAccount[]>([]);
  readonly client = signal<ClientDetail | null>(null);
  readonly users = signal<PlatformUser[]>([]);
  readonly subscriptions = signal<SubscriptionRecord[]>([]);
  readonly plans = signal<PlanRecord[]>([]);

  readonly pageTitle = computed(() => {
    switch (this.page()) {
      case 'clients':
        return 'Clientes';
      case 'client-detail':
        return this.client()?.name || 'Detalhe do cliente';
      case 'users':
        return 'Usuários';
      case 'subscriptions':
        return 'Assinaturas';
      case 'plans':
        return 'Planos';
      case 'metrics':
        return 'Métricas globais';
      case 'settings':
        return 'Configurações';
      default:
        return 'Dashboard';
    }
  });

  readonly pageSubtitle = computed(() => {
    switch (this.page()) {
      case 'clients':
        return 'Gerencie contas SaaS, status, planos e consumo de cada cliente.';
      case 'client-detail':
        return 'Acompanhe dados, uso, álbuns e ações administrativas da conta.';
      case 'users':
        return 'Visualize usuários cadastrados, roles, provider e status.';
      case 'subscriptions':
        return 'Acompanhe planos ativos, pagamentos, renovação e inadimplência.';
      case 'plans':
        return 'Controle o catálogo de planos, limites e recursos disponíveis.';
      case 'metrics':
        return 'Consolide crescimento, armazenamento, visualizações e receita.';
      case 'settings':
        return 'Ajustes internos, permissões e integrações operacionais.';
      default:
        return 'Visão geral operacional do SaaS Caverna Digital.';
    }
  });

  constructor() {
    combineLatest([this.route.data, this.route.paramMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([data, params]) => {
        this.page.set((data['page'] as PageKey) || 'dashboard');
        void this.load(params.get('id'));
      });
  }

  canChangePlans(): boolean {
    return this.auth.hasAnyRole(['super_admin', 'admin']);
  }

  canDeleteClients(): boolean {
    return this.auth.hasAnyRole(['super_admin']);
  }

  usagePercent(used: number, limit: number | null): number {
    if (!limit) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  }

  formatLimit(limit: number | null): string {
    return limit === null ? 'sem limite' : limit.toLocaleString('pt-BR');
  }

  async blockClient(client: ClientAccount | ClientDetail): Promise<void> {
    await this.changeStatus(client, 'blocked');
  }

  async unblockClient(client: ClientAccount | ClientDetail): Promise<void> {
    await this.changeStatus(client, 'active');
  }

  async changeStatus(client: ClientAccount | ClientDetail, status: string): Promise<void> {
    if (!confirm(`Confirmar alteração do status da conta "${client.name}" para ${status}?`)) return;

    try {
      await this.api.updateClientStatus(client.id, status);
      this.toast('Status atualizado com sucesso.');
      await this.load(this.client()?.id ?? null);
    } catch {
      this.toast('Não foi possível atualizar o status.');
    }
  }

  async deleteClient(client: ClientAccount | ClientDetail): Promise<void> {
    if (!this.canDeleteClients()) {
      this.toast('Apenas super_admin pode excluir clientes.');
      return;
    }

    if (!confirm(`Excluir permanentemente a conta "${client.name}"?`)) return;

    try {
      await this.api.deleteClient(client.id);
      this.toast('Cliente excluído com sucesso.');
      await this.load(null);
    } catch {
      this.toast('Não foi possível excluir o cliente.');
    }
  }

  actionToast(message: string): void {
    this.toast(message);
  }

  private async load(clientId: string | null): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      switch (this.page()) {
        case 'clients':
          this.clients.set(await this.api.getClients());
          break;
        case 'client-detail':
          if (clientId) this.client.set(await this.api.getClient(clientId));
          break;
        case 'users':
          this.users.set(await this.api.getUsers());
          break;
        case 'subscriptions':
          this.subscriptions.set(await this.api.getSubscriptions());
          break;
        case 'plans':
          this.plans.set(await this.api.getPlans());
          break;
        case 'metrics':
          this.dashboard.set(await this.api.getMetrics());
          break;
        case 'settings':
          await this.auth.refreshMe();
          break;
        default:
          this.dashboard.set(await this.api.getDashboard());
          break;
      }
    } catch {
      this.error.set('Não foi possível carregar os dados. Verifique a API e suas permissões.');
    } finally {
      this.loading.set(false);
    }
  }

  private toast(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 3200, horizontalPosition: 'right', verticalPosition: 'top' });
  }
}
