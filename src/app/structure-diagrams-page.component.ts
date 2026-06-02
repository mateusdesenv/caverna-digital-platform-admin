import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DiagramNode, StructureDiagramComponent } from './structure-diagram.component';

type DiagramTab = 'overview' | 'components' | 'domain' | 'deploy';

interface DiagramDefinition {
  id: DiagramTab;
  label: string;
  title: string;
  description: string;
  nodes: DiagramNode[];
  mermaid: string;
}

const diagrams: DiagramDefinition[] = [
  {
    id: 'overview',
    label: 'Visão Geral',
    title: 'Diagrama Geral da Plataforma',
    description: 'Estrutura macro dos projetos, serviços e plataformas que compõem o SaaS Caverna Digital.',
    nodes: [
      {
        title: 'Caverna Digital SaaS',
        subtitle: 'Ecossistema principal',
        kind: 'infra',
        children: [
          { title: 'caverna-digital-web', subtitle: 'Site público dos portfólios', kind: 'frontend' },
          { title: 'caverna-digital-admin', subtitle: 'Painel usado pelos fotógrafos/clientes', kind: 'frontend' },
          { title: 'caverna-digital-master-admin', subtitle: 'Painel interno da Caverna Digital', kind: 'frontend' },
          { title: 'caverna-digital-api', subtitle: 'API central da plataforma', kind: 'backend' },
          { title: 'MongoDB', subtitle: 'Usuários, planos, álbuns, imagens e métricas', kind: 'database' },
          { title: 'Firebase Auth', subtitle: 'Login com Google', kind: 'firebase' },
          { title: 'Firebase Storage', subtitle: 'Capas e imagens dos álbuns', kind: 'firebase' },
        ],
      },
    ],
    mermaid: `graph TD
  A[Caverna Digital SaaS]
  A --> B[caverna-digital-web<br/>Site público dos portfólios]
  A --> C[caverna-digital-admin<br/>Painel usado pelos fotógrafos/clientes]
  A --> D[caverna-digital-master-admin<br/>Painel interno da Caverna Digital]
  A --> E[caverna-digital-api<br/>API central da plataforma]
  A --> F[MongoDB<br/>Usuários, planos, álbuns, imagens e métricas]
  A --> G[Firebase Auth<br/>Login com Google]
  A --> H[Firebase Storage<br/>Capas e imagens dos álbuns]`,
  },
  {
    id: 'components',
    label: 'Componentes',
    title: 'Diagrama de Componentes',
    description: 'Comunicação entre frontends, API, banco de dados e serviços Firebase.',
    nodes: [
      {
        title: 'Frontends',
        subtitle: 'Interfaces da plataforma',
        kind: 'frontend',
        children: [
          { title: 'Site Público', subtitle: 'Consulta álbuns e incrementa visualizações', kind: 'frontend' },
          { title: 'Admin Cliente', subtitle: 'Gerencia álbuns, imagens e portfólio', kind: 'frontend' },
          { title: 'Admin Master', subtitle: 'Gerencia clientes, planos e operação', kind: 'frontend' },
        ],
      },
      {
        title: 'API Node/Express',
        subtitle: 'Contratos REST, JWT, validações e regras',
        kind: 'backend',
        children: [
          { title: 'MongoDB', subtitle: 'Persistência principal', kind: 'database' },
          { title: 'Firebase Auth', subtitle: 'Validação de identidade Google', kind: 'firebase' },
          { title: 'Firebase Storage', subtitle: 'Arquivos de imagem', kind: 'firebase' },
        ],
      },
    ],
    mermaid: `graph LR
  WEB[Site Público] --> API[API Node/Express]
  CLIENT[Admin Cliente] --> API
  MASTER[Admin Master] --> API
  API --> DB[MongoDB]
  API --> AUTH[Firebase Auth]
  API --> STORAGE[Firebase Storage]`,
  },
  {
    id: 'domain',
    label: 'Domínio',
    title: 'Diagrama de Domínio',
    description: 'Entidades centrais do produto e suas relações funcionais.',
    nodes: [
      {
        title: 'User',
        subtitle: 'Cliente/usuário da plataforma',
        kind: 'domain',
        children: [
          { title: 'Subscription', subtitle: 'Assinatura atual', kind: 'domain' },
          { title: 'Plan', subtitle: 'Plano contratado', kind: 'domain' },
          { title: 'Albums', subtitle: 'Álbuns do portfólio', kind: 'domain' },
          { title: 'Usage', subtitle: 'Uso e limites consumidos', kind: 'domain' },
        ],
      },
      {
        title: 'Album',
        subtitle: 'Coleção visual publicada',
        kind: 'domain',
        children: [
          { title: 'Images', subtitle: 'Fotos ordenadas', kind: 'domain' },
          { title: 'CoverImage', subtitle: 'Capa do álbum', kind: 'domain' },
          { title: 'Views', subtitle: 'Contador de visualizações', kind: 'domain' },
          { title: 'DisplayOrder', subtitle: 'Ordem no site público', kind: 'domain' },
        ],
      },
      {
        title: 'Plan',
        subtitle: 'Define limites comerciais',
        kind: 'domain',
        children: [
          { title: 'AlbumLimit', subtitle: 'Quantidade de álbuns', kind: 'domain' },
          { title: 'ImageLimit', subtitle: 'Quantidade de imagens', kind: 'domain' },
          { title: 'StorageLimit', subtitle: 'Armazenamento disponível', kind: 'domain' },
          { title: 'MonthlyViewsLimit', subtitle: 'Visualizações mensais', kind: 'domain' },
        ],
      },
    ],
    mermaid: `graph TD
  USER[User] --> SUB[Subscription]
  USER --> PLAN[Plan]
  USER --> ALBUMS[Albums]
  USER --> USAGE[Usage]
  ALBUM[Album] --> IMAGES[Images]
  ALBUM --> COVER[CoverImage]
  ALBUM --> VIEWS[Views]
  ALBUM --> ORDER[DisplayOrder]
  PLAN --> ALIMIT[AlbumLimit]
  PLAN --> ILIMIT[ImageLimit]
  PLAN --> SLIMIT[StorageLimit]
  PLAN --> VLIMIT[MonthlyViewsLimit]`,
  },
  {
    id: 'deploy',
    label: 'Deploy',
    title: 'Diagrama de Deploy',
    description: 'Distribuição dos projetos por ambiente de hospedagem e serviços externos.',
    nodes: [
      {
        title: 'Vercel',
        subtitle: 'Hospedagem dos frontends',
        kind: 'infra',
        children: [
          { title: 'caverna-digital-web', subtitle: 'Site público', kind: 'frontend' },
          { title: 'caverna-digital-admin', subtitle: 'Admin do cliente', kind: 'frontend' },
          { title: 'caverna-digital-master-admin', subtitle: 'Admin interno', kind: 'frontend' },
        ],
      },
      {
        title: 'API Hosting',
        subtitle: 'Runtime Node/Express',
        kind: 'backend',
        children: [{ title: 'caverna-digital-api', subtitle: 'Endpoints REST', kind: 'backend' }],
      },
      {
        title: 'MongoDB Atlas',
        subtitle: 'Banco principal',
        kind: 'database',
        children: [{ title: 'Banco principal', subtitle: 'Coleções operacionais', kind: 'database' }],
      },
      {
        title: 'Firebase',
        subtitle: 'Serviços auxiliares',
        kind: 'firebase',
        children: [
          { title: 'Authentication', subtitle: 'Google Login', kind: 'firebase' },
          { title: 'Storage', subtitle: 'Imagens e capas', kind: 'firebase' },
        ],
      },
    ],
    mermaid: `graph TD
  VERCEL[Vercel] --> WEB[caverna-digital-web]
  VERCEL --> ADMIN[caverna-digital-admin]
  VERCEL --> MASTER[caverna-digital-master-admin]
  HOST[API Hosting] --> API[caverna-digital-api]
  ATLAS[MongoDB Atlas] --> DB[Banco principal]
  FIREBASE[Firebase] --> AUTH[Authentication]
  FIREBASE --> STORAGE[Storage]`,
  },
];

@Component({
  selector: 'app-structure-diagrams-page',
  standalone: true,
  imports: [MatButtonModule, MatSnackBarModule, StructureDiagramComponent],
  templateUrl: './structure-diagrams-page.component.html',
  styleUrl: './structure-diagrams-page.component.scss',
})
export class StructureDiagramsPageComponent {
  private readonly snackBar = inject(MatSnackBar);
  readonly tabs = diagrams;
  readonly activeTab = signal<DiagramTab>('overview');
  readonly activeDiagram = computed(() => diagrams.find((diagram) => diagram.id === this.activeTab()) ?? diagrams[0]);

  setActiveTab(tab: DiagramTab): void {
    this.activeTab.set(tab);
  }

  async copyMermaid(): Promise<void> {
    await navigator.clipboard.writeText(this.activeDiagram().mermaid);
    this.snackBar.open('Mermaid copiado para a área de transferência.', 'Fechar', {
      duration: 2600,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  exportPng(): void {
    this.snackBar.open('Exportação em PNG preparada para implementação futura.', 'Fechar', {
      duration: 2600,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
