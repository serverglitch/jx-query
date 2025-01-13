# jxQuery

[![Bundlephobia](https://badgen.net/bundlephobia/dependency-count/jx-query)](https://bundlephobia.com/result?p=jx-query)
[![Bundlephobia](https://badgen.net/bundlephobia/min/jx-query)](https://bundlephobia.com/result?p=jx-query)
[![Bundlephobia](https://badgen.net/bundlephobia/minzip/jx-query)](https://bundlephobia.com/result?p=jx-query)

### Yet another tiny jQuery-alike. If that's the case, why bother?

- It makes use of proxies, exposing the underlying elements when you just want vanilla JS.
- It hopefully provides a nice balance between ergonomics and usefulness for its size.
- It provides an easy way to add your own functionality.

### Show me what you've got then

Its core functions are what you'd expect, `$()` and `$$()` for single elements and lists respectively.

`$()` can accept either a CSS selector or an Element and will return a proxied `Element` or `null`.

```typescript
const el = $('div.container')
const el2 = $(el) // this will pass back the proxied el and won't make a proxy of a proxy

const el3 = document.querySelector('body') // non-proxied element
const el4 = $(el3) // this will create a new proxy
```

`$$()` accepts a CSS selector and will return an `Array` (rather than a `NodeList`) of proxy-wrapped Elements.

Function calls are chainable outside of terminating functions like `getAttribute` or `map`.

`$$()` functions will apply to all of the Elements of the Array following the same return rules as `$()`.

```typescript
const els = $$('a')

// set listener on all anchor elements, wrap e.target with $() and use base Array's map method
// map returns values so it's a terminating call (cannot chain)
els
  .css('background-color: red')
  .on('pointerover', (e) => console.log($(e.target).attribute('href')))
  .map((e) => e.attribute('href'))
```

#### Functions

##### attribute()

```typescript
type attribute = (
  attr: string | object,
  value?: any
) => string | null | undefined

const el = $('div') // returns Element or null

el.attribute('name') // get the value of the passed attribute, null if not found
el.attribute('name', 'jxQuery') // set attribute
el.attribute('name', null) // passing null specifically will remove the attribute

// it also accept objects for set/null
el.attribute({
  name: 'href',
  target: null
})

const els = $$('a') // returns Element[]

els.attribute('href') // returns an array of hrefs from all anchor elements
```

###### css()

```typescript
type css = (styles: string | object) => void

const els = $$('div') // returns Element[]

els.css({ borderWidth: 'medium', 'border-color': 'red' }) // object accepts kebab and camelCase
els.css('background: red; opacity: .5') // strings are destructive, overwriting the entire style attribute
```

##### on()

```typescript
// el.addEventListener
type on = (
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
) => ProxyHandler<Element | Element[]>

const el = $('div')

el.on('click', (e) => console.log(e.target)).on('pointerover', (e) =>
  console.log('hovering over', e.target)
)
```

##### off()

```typescript
// el.removeEventListener
type off = (
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | EventListenerOptions
) => ProxyHandler<Element | Element[]>

const el = $('div')
const fn = (e) => console.log(e)

el.on('click', fn).css('background-color:pink').off('click', fn)
```

##### addClass()

```typescript
// el.classList.add
type addClass = (...tokens: string[]) => ProxyHandler<Element | Element[]>

$('main').addClass('boop', 'doop', 'swoop').attribute('class') // 'boop doop swoop'
```

##### removeClass()

```typescript
// el.classList.remove
type removeClass = (...tokens: string[]) => ProxyHandler<Element | Element[]>

$('button').removeClass('btn-primary').addClass('btn-info')
```

##### toggleClass()

```typescript
// el.classList.toggle with void override for chaining
type toggleClass = (
  token: string,
  force?: boolean
) => ProxyHandler<Element | Element[]>

$('div#chart').toggleClass('hide', true) //force true acts like add, false like remove
```

##### replaceClass()

```typescript
// el.classList.replace with void override for chaining
type replaceClass = (
  oldToken: string,
  newToken: string
) => ProxyHandler<Element | Element[]>

$$('button').replaceClass('btn-primary', 'btn-info')
```

##### trigger()

```typescript
// el.dispatchEvent(new Event(type: string, eventInitDict?: EventInit) => Event) with void override
type trigger = (
  type: string,
  eventInitDict?: EventInit
) => ProxyHandler<Element | Element[]>

$('button').trigger('click')
```

##### remove()

```typescript
// el.parentNode.removeChild
type remove = () => ProxyHandler<Element | Element[]>

$('div').remove() // this ONLY removes the dom element, the js reference still exists
```

#### Convenience Functions on $

##### $.makeGlobal()

Exactly what's written on the tin, binds `$` and `$$` to the global scope.

```typescript
$.makeGlobal()
```

##### $.ready()

```typescript
// run callback function when dom is loaded
$.ready(() => console.log('DOM is ready!'))
```

##### $.addHandler()

Any function here will be added to the proxy's `get` function as `prop: (target, args) => any`.
A return value other than `undefined` or `null` will be terminating.

```typescript
// add enable/disable functions
$.addHandler('enable', (target) => (target.disabled = false))
$.addHandler('disable', (target) => (target.disabled = true))
```

---

Inspired to various degrees by projects like [jQuery](https://jquery.com/), [htmx](https://htmx.org/), [surreal.js](https://github.com/gnat/surreal), this [DomQuery gist](https://gist.github.com/AdaRoseCannon/d95a7cbb8edd730443c62f0daff875ac), and [Alpine.js](https://alpinejs.dev/).

All of this can be done in fairly painless [vanilla.js](https://youmightnotneedjquery.com), but if you like the ergonomics of this tiny library, any of the vanilla.js solutions can be ported in as handlers.
