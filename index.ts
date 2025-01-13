const $ = (qs: Element | string): Element | null => {
  if ((qs as Element & { proxied: boolean }).proxied) return qs as Element
  const el = qs instanceof Element ? qs : document.querySelector(qs as string)
  return el ? (new Proxy(el, handler) as Element) : null
}

$.ready = (fn: Function) => {
  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      fn as EventListenerOrEventListenerObject
    )
  } else {
    fn()
  }
}

$.addHandler = (name: string, handler: Handler) => (handlers[name] = handler)
$.makeGlobal = () =>
  $.ready(() => {
    window.$ = $
    window.$$ = $$
  })

const $$ = (qsa: string): Element[] => {
  const els = document.querySelectorAll(qsa)
  return new Proxy(
    Array.from(els).map((e) => $(e)!),
    handler
  ) as Element[]
}

const css = function (this: HTMLElement, styles: string | object) {
  if (!(this instanceof HTMLElement)) return
  // @ts-ignore readonly exception for CSSStyleDeclaration assignment
  if (typeof styles === 'string') this.style = styles
  else if (typeof styles === 'object') {
    for (const k in styles) {
      this.style[k as any] = (styles as Record<string, string>)[
        k as keyof Record<string, string>
      ]
    }
  }
}

const attribute = function (this: Element, attr: string | object, value?: any) {
  if (typeof attr === 'object') {
    for (const k in attr) {
      attribute.apply(this, [
        k,
        (attr as Record<string, any>)[k as keyof Record<string, any>]
      ])
    }
  } else if (value === undefined) return this.getAttribute(attr as string)
  else if (value === null) this.removeAttribute(attr as string)
  else this.setAttribute(attr as string, value)
}

const handlers: { [k: string]: Handler } = {
  attribute: (target, args: [string | object, any?]) =>
    attribute.apply(target, args),
  css: (target, args: [string | object]) =>
    css.apply(target as HTMLElement, args),
  on: (target, args: Parameters<HTMLElement['addEventListener']>) =>
    target.addEventListener(...args),
  off: (target, args: Parameters<HTMLElement['removeEventListener']>) =>
    target.removeEventListener(...args),
  addClass: (target, args: string[]) => target.classList.add(...args),
  removeClass: (target, args: string[]) => target.classList.remove(...args),
  toggleClass: (target, args: [string, boolean?]) =>
    void target.classList.toggle(...args),
  replaceClass: (target, args: [string, string]) =>
    void target.classList.replace(...args),
  trigger: (target, args) =>
    void target.dispatchEvent(new Event(...(args as [string, EventInit?]))),
  remove: (target) =>
    target.parentNode?.removeChild.apply(target.parentNode, [target])
}

const handler = {
  get(
    target: Element | Element[],
    prop: string,
    rec: ProxyHandler<Element | Element[]>
  ) {
    if (prop === 'proxied') return true
    if (!Object.keys(handlers).includes(prop))
      return target[prop as keyof (Element | Element[])]
    const isElement = target instanceof Element
    return (...args: any) => {
      const res = (isElement ? [target] : target).map((e: Element) => {
        return (handlers[prop as keyof Element] as Function)(e, args) || e
      })
      if (isElement) return res[0]
      return res.every((r) => !r.proxied) ? res : rec
    }
  },
  set(target: Element, prop: string, value: any) {
    // @ts-ignore override for proxy
    target[prop as keyof Element] = value
    return true
  }
}

type Target = Element | HTMLElement
type Handler = (target: Target, ...args: any[]) => any
declare const window: {
  $: (qs: Element | string) => Element | null
  $$: (qsa: string) => Element[]
} & Window

export { $, $$ }
