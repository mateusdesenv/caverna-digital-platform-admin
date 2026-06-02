import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';
import { MasterApiService } from './master-api.service';
import { PlanFeatures, PlanRecord } from './master.models';

type PlanForm = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number | null;
  status: PlanRecord['status'];
  isFeatured: boolean;
  commercialBadges: PlanRecord['commercialBadges'];
  limits: {
    albums: number | null;
    images: number | null;
    storageGb: number | null;
    monthlyViews: number | null;
  };
  unlimited: {
    albums: boolean;
    images: boolean;
    storageGb: boolean;
    monthlyViews: boolean;
  };
  features: PlanFeatures;
};

const emptyFeatures: PlanFeatures = {
  publicPortfolio: false,
  analytics: false,
  customDomain: false,
  removeBranding: false,
  multiUser: false,
  privateGalleries: false,
  integrations: false,
  backups: false,
  prioritySupport: false,
  viewCounter: false,
  albumOrganization: false,
};

const featureLabels: Array<{ key: keyof PlanFeatures; label: string }> = [
  { key: 'publicPortfolio', label: 'Portfólio Público' },
  { key: 'viewCounter', label: 'Contador de Visualizações' },
  { key: 'albumOrganization', label: 'Organização de Álbuns' },
  { key: 'removeBranding', label: 'Remover Marca Caverna Digital' },
  { key: 'customDomain', label: 'Domínio Personalizado' },
  { key: 'analytics', label: 'Analytics Avançado' },
  { key: 'privateGalleries', label: 'Galerias Privadas' },
  { key: 'multiUser', label: 'Multiusuário' },
  { key: 'integrations', label: 'Integrações' },
  { key: 'backups', label: 'Backup Avançado' },
  { key: 'prioritySupport', label: 'Suporte Prioritário' },
];

const limitLabels: Array<{ key: keyof PlanForm['limits']; label: string }> = [
  { key: 'albums', label: 'Quantidade máxima de álbuns' },
  { key: 'images', label: 'Quantidade máxima de imagens' },
  { key: 'storageGb', label: 'Armazenamento máximo (GB)' },
  { key: 'monthlyViews', label: 'Visualizações mensais' },
];

@Component({
  selector: 'app-plans-management',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './plans-management.component.html',
  styleUrl: './plans-management.component.scss',
})
export class PlansManagementComponent {
  private readonly api = inject(MasterApiService);
  private readonly auth = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  readonly plans = signal<PlanRecord[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly modalOpen = signal(false);
  readonly editingPlan = signal<PlanRecord | null>(null);
  readonly featureOptions = featureLabels;
  readonly limitOptions = limitLabels;
  readonly form = signal<PlanForm>(this.createEmptyForm());

  constructor() {
    void this.loadPlans();
  }

  canManagePlans(): boolean {
    return this.auth.hasAnyRole(['super_admin', 'admin']);
  }

  canDeletePlans(): boolean {
    return this.auth.hasAnyRole(['super_admin']);
  }

  openCreateModal(): void {
    this.editingPlan.set(null);
    this.form.set(this.createEmptyForm());
    this.modalOpen.set(true);
  }

  openEditModal(plan: PlanRecord): void {
    this.editingPlan.set(plan);
    this.form.set({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      status: plan.status,
      isFeatured: plan.isFeatured,
      commercialBadges: { ...plan.commercialBadges },
      limits: {
        albums: plan.limits.albums,
        images: plan.limits.images,
        storageGb: plan.limits.storageGb,
        monthlyViews: plan.limits.monthlyViews,
      },
      unlimited: {
        albums: plan.limits.albums === null,
        images: plan.limits.images === null,
        storageGb: plan.limits.storageGb === null,
        monthlyViews: plan.limits.monthlyViews === null,
      },
      features: { ...emptyFeatures, ...plan.features },
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  async savePlan(): Promise<void> {
    if (!this.canManagePlans()) {
      this.toast('Você não tem permissão para gerenciar planos.');
      return;
    }

    const form = this.form();
    if (!form.name.trim()) {
      this.toast('Informe o nome do plano.');
      return;
    }

    this.saving.set(true);

    try {
      const payload = this.toPayload(form);
      if (form.id) {
        await this.api.updatePlan(form.id, payload);
        this.toast('Plano atualizado com sucesso.');
      } else {
        await this.api.createPlan(payload);
        this.toast('Plano criado com sucesso.');
      }

      this.closeModal();
      await this.loadPlans();
    } catch (error) {
      this.toast(error instanceof Error ? error.message : 'Não foi possível salvar o plano.');
    } finally {
      this.saving.set(false);
    }
  }

  async duplicatePlan(plan: PlanRecord): Promise<void> {
    if (!this.canManagePlans()) return;

    try {
      await this.api.duplicatePlan(plan.id);
      this.toast('Plano duplicado como rascunho.');
      await this.loadPlans();
    } catch {
      this.toast('Não foi possível duplicar o plano.');
    }
  }

  async toggleStatus(plan: PlanRecord): Promise<void> {
    if (!this.canManagePlans()) return;

    const nextStatus = plan.status === 'active' ? 'inactive' : 'active';
    try {
      await this.api.updatePlanStatus(plan.id, nextStatus);
      this.toast(nextStatus === 'active' ? 'Plano ativado.' : 'Plano desativado.');
      await this.loadPlans();
    } catch {
      this.toast('Não foi possível alterar o status do plano.');
    }
  }

  async deletePlan(plan: PlanRecord): Promise<void> {
    if (!this.canDeletePlans()) {
      this.toast('Apenas super_admin pode excluir planos.');
      return;
    }

    if (!confirm(`Excluir o plano "${plan.name}"?`)) return;

    try {
      await this.api.deletePlan(plan.id);
      this.toast('Plano excluído com sucesso.');
      await this.loadPlans();
    } catch {
      this.toast('Não é possível excluir um plano com clientes ativos.');
    }
  }

  updateForm(mutator: (form: PlanForm) => void): void {
    const nextForm = structuredClone(this.form());
    mutator(nextForm);
    this.form.set(nextForm);
  }

  setField(field: 'name' | 'slug' | 'description', value: string): void {
    this.updateForm((form) => {
      form[field] = value;
    });
  }

  setNumberField(field: 'monthlyPrice' | 'yearlyPrice', value: number | string | null): void {
    this.updateForm((form) => {
      if (field === 'monthlyPrice') {
        form.monthlyPrice = value === '' || value === null ? 0 : Number(value);
        return;
      }

      form.yearlyPrice = value === '' || value === null ? null : Number(value);
    });
  }

  setStatus(status: PlanRecord['status']): void {
    this.updateForm((form) => {
      form.status = status;
    });
  }

  setLimit(field: keyof PlanForm['limits'], value: number | string): void {
    this.updateForm((form) => {
      form.limits[field] = value === '' ? 0 : Number(value);
    });
  }

  setFeature(field: keyof PlanFeatures, enabled: boolean): void {
    this.updateForm((form) => {
      form.features[field] = enabled;
    });
  }

  setBadge(field: keyof PlanForm['commercialBadges'], enabled: boolean): void {
    this.updateForm((form) => {
      form.commercialBadges[field] = enabled;
    });
  }

  setFeatured(enabled: boolean): void {
    this.updateForm((form) => {
      form.isFeatured = enabled;
    });
  }

  setUnlimited(field: keyof PlanForm['limits'], enabled: boolean): void {
    this.updateForm((form) => {
      form.unlimited[field] = enabled;
      form.limits[field] = enabled ? null : 0;
    });
  }

  formatLimit(value: number | null, suffix = ''): string {
    return value === null ? 'Ilimitado' : `${value.toLocaleString('pt-BR')}${suffix}`;
  }

  private async loadPlans(): Promise<void> {
    this.loading.set(true);

    try {
      this.plans.set(await this.api.getPlans());
    } catch {
      this.toast('Não foi possível carregar os planos.');
    } finally {
      this.loading.set(false);
    }
  }

  private createEmptyForm(): PlanForm {
    return {
      name: '',
      slug: '',
      description: '',
      monthlyPrice: 0,
      yearlyPrice: null,
      status: 'draft',
      isFeatured: false,
      commercialBadges: {
        recommended: false,
        bestSeller: false,
        isNew: false,
      },
      limits: {
        albums: 0,
        images: 0,
        storageGb: 0,
        monthlyViews: 0,
      },
      unlimited: {
        albums: false,
        images: false,
        storageGb: false,
        monthlyViews: false,
      },
      features: { ...emptyFeatures },
    };
  }

  private toPayload(form: PlanForm): Partial<PlanRecord> {
    return {
      name: form.name,
      slug: form.slug,
      description: form.description,
      monthlyPrice: Number(form.monthlyPrice) || 0,
      yearlyPrice: form.yearlyPrice === null ? null : Number(form.yearlyPrice) || 0,
      status: form.status,
      isFeatured: form.isFeatured,
      commercialBadges: form.commercialBadges,
      limits: {
        albums: form.unlimited.albums ? null : Number(form.limits.albums) || 0,
        images: form.unlimited.images ? null : Number(form.limits.images) || 0,
        storageGb: form.unlimited.storageGb ? null : Number(form.limits.storageGb) || 0,
        monthlyViews: form.unlimited.monthlyViews ? null : Number(form.limits.monthlyViews) || 0,
      } as PlanRecord['limits'],
      features: form.features,
    };
  }

  private toast(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3200,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
