import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import {
  ApiResponse,
  ClientAccount,
  ClientDetail,
  DashboardMetrics,
  PlanRecord,
  PlatformUser,
  SubscriptionRecord,
} from './master.models';

@Injectable({ providedIn: 'root' })
export class MasterApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/master`;

  getDashboard(): Promise<DashboardMetrics> {
    return this.get<DashboardMetrics>('/dashboard');
  }

  getClients(): Promise<ClientAccount[]> {
    return this.get<ClientAccount[]>('/clients');
  }

  getClient(id: string): Promise<ClientDetail> {
    return this.get<ClientDetail>(`/clients/${id}`);
  }

  updateClientStatus(id: string, status: string): Promise<ClientDetail> {
    return this.patch<ClientDetail>(`/clients/${id}/status`, { status });
  }

  updateClientPlan(id: string, planKey: string): Promise<ClientDetail> {
    return this.patch<ClientDetail>(`/clients/${id}/plan`, { planKey });
  }

  deleteClient(id: string): Promise<void> {
    return this.delete<void>(`/clients/${id}`);
  }

  getUsers(): Promise<PlatformUser[]> {
    return this.get<PlatformUser[]>('/users');
  }

  getSubscriptions(): Promise<SubscriptionRecord[]> {
    return this.get<SubscriptionRecord[]>('/subscriptions');
  }

  getPlans(): Promise<PlanRecord[]> {
    return this.get<PlanRecord[]>('/plans');
  }

  getMetrics(): Promise<DashboardMetrics> {
    return this.get<DashboardMetrics>('/metrics');
  }

  private async get<T>(path: string): Promise<T> {
    const response = await firstValueFrom(this.http.get<ApiResponse<T>>(`${this.baseUrl}${path}`));
    return response.data;
  }

  private async patch<T>(path: string, body: unknown): Promise<T> {
    const response = await firstValueFrom(this.http.patch<ApiResponse<T>>(`${this.baseUrl}${path}`, body));
    return response.data;
  }

  private async delete<T>(path: string): Promise<T> {
    const response = await firstValueFrom(this.http.delete<ApiResponse<T>>(`${this.baseUrl}${path}`));
    return response.data;
  }
}
