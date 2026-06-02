export type AdminRole = 'super_admin' | 'admin' | 'support' | 'finance';
export type AccountStatus = 'active' | 'blocked' | 'pending' | 'canceled';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'free';

export interface MasterUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AccountStatus;
}

export interface DashboardMetrics {
  totalClients: number;
  activeUsers: number;
  freeUsers: number;
  paidUsers: number;
  albumsCreated: number;
  imagesUploaded: number;
  totalViews: number;
  estimatedMonthlyRevenue: number;
  storageGbUsed: number;
  recentClients: ClientAccount[];
  planDistribution: Array<{ plan: string; count: number }>;
}

export interface ClientAccount {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  firebaseUid?: string;
  planKey?: string;
  status: AccountStatus;
  albumsCount: number;
  imagesCount: number;
  viewsCount: number;
  storageGbUsed: number;
  createdAt: string;
  lastLogin?: string;
}

export interface ClientDetail extends ClientAccount {
  usage: {
    albums: UsageMetric;
    images: UsageMetric;
    storageGb: UsageMetric;
    monthlyViews: UsageMetric;
  };
  albums: ClientAlbum[];
}

export interface ClientAlbum {
  id: string;
  coverUrl: string;
  title: string;
  category: string;
  imagesCount: number;
  views: number;
  status: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  provider: 'password' | 'google';
  role: string;
  planKey?: string;
  status: AccountStatus;
  createdAt: string;
  lastLogin?: string;
}

export interface SubscriptionRecord {
  id: string;
  clientName: string;
  clientEmail: string;
  planKey: string;
  status: SubscriptionStatus;
  price: number;
  startedAt?: string;
  renewalDate?: string;
  paymentMethod?: string;
}

export interface PlanRecord {
  id: string;
  key: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  monthlyPrice: number;
  yearlyPrice: number | null;
  status: 'active' | 'inactive' | 'draft';
  isActive: boolean;
  isFeatured: boolean;
  commercialBadges: {
    recommended: boolean;
    bestSeller: boolean;
    isNew: boolean;
  };
  limits: {
    albumLimit: number | null;
    imageLimit: number | null;
    storageGbLimit: number | null;
    monthlyViewsLimit: number | null;
    albums: number | null;
    images: number | null;
    storageGb: number | null;
    monthlyViews: number | null;
  };
  features: PlanFeatures;
  featureList: string[];
  clientCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlanFeatures {
  publicPortfolio: boolean;
  analytics: boolean;
  customDomain: boolean;
  removeBranding: boolean;
  multiUser: boolean;
  privateGalleries: boolean;
  integrations: boolean;
  backups: boolean;
  prioritySupport: boolean;
  viewCounter: boolean;
  albumOrganization: boolean;
}

export interface UsageMetric {
  used: number;
  limit: number | null;
}

export interface ApiResponse<T> {
  data: T;
}
