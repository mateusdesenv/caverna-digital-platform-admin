import { Component, input } from '@angular/core';

export type DiagramNodeKind = 'frontend' | 'backend' | 'database' | 'firebase' | 'infra' | 'domain';

export interface DiagramNode {
  title: string;
  subtitle?: string;
  kind: DiagramNodeKind;
  children?: DiagramNode[];
}

@Component({
  selector: 'app-structure-diagram',
  standalone: true,
  templateUrl: './structure-diagram.component.html',
  styleUrl: './structure-diagram.component.scss',
})
export class StructureDiagramComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly nodes = input.required<DiagramNode[]>();
}
