export type ElementProxy = {
  (qs: Element | string): Element | null
  ready(fn: Function): void
  addHandler(name: string, handler: Handler): Handler
  makeGlobal(): void
}

export type ElementArrayProxy = (qsa: string) => Element[]

export type Handler = (target: Target, ...args: any[]) => any

export type Target = Element | HTMLElement

export declare global {
  interface Window {
    $: ElementProxy
    $$: ElementArrayProxy
  }
}
