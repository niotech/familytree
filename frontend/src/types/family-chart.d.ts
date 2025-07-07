declare module 'family-chart' {
  export function createChart(container: HTMLElement, options: any): {
    destroy?(): void;
  };
}