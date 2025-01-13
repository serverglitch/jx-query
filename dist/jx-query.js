// index.ts
var $ = (qs) => {
  if (qs.proxied)
    return qs;
  const el = qs instanceof Element ? qs : document.querySelector(qs);
  return el ? new Proxy(el, handler) : null;
};
$.ready = (fn) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
};
$.addHandler = (name, handler) => handlers[name] = handler;
$.makeGlobal = () => $.ready(() => {
  window.$ = $;
  window.$$ = $$;
});
var $$ = (qsa) => {
  const els = document.querySelectorAll(qsa);
  return new Proxy(Array.from(els).map((e) => $(e)), handler);
};
var css = function(styles) {
  if (!(this instanceof HTMLElement))
    return;
  if (typeof styles === "string")
    this.style = styles;
  else if (typeof styles === "object") {
    for (const k in styles) {
      this.style[k] = styles[k];
    }
  }
};
var attribute = function(attr, value) {
  if (typeof attr === "object") {
    for (const k in attr) {
      attribute.apply(this, [
        k,
        attr[k]
      ]);
    }
  } else if (value === undefined)
    return this.getAttribute(attr);
  else if (value === null)
    this.removeAttribute(attr);
  else
    this.setAttribute(attr, value);
};
var handlers = {
  attribute: (target, args) => attribute.apply(target, args),
  css: (target, args) => css.apply(target, args),
  on: (target, args) => target.addEventListener(...args),
  off: (target, args) => target.removeEventListener(...args),
  addClass: (target, args) => target.classList.add(...args),
  removeClass: (target, args) => target.classList.remove(...args),
  toggleClass: (target, args) => void target.classList.toggle(...args),
  replaceClass: (target, args) => void target.classList.replace(...args),
  trigger: (target, args) => void target.dispatchEvent(new Event(...args)),
  remove: (target) => target.parentNode?.removeChild.apply(target.parentNode, [target])
};
var handler = {
  get(target, prop, rec) {
    if (prop === "proxied")
      return true;
    if (!Object.keys(handlers).includes(prop))
      return target[prop];
    const isElement = target instanceof Element;
    return (...args) => {
      const res = (isElement ? [target] : target).map((e) => {
        return handlers[prop](e, args) || e;
      });
      if (isElement)
        return res[0];
      return res.every((r) => !r.proxied) ? res : rec;
    };
  },
  set(target, prop, value) {
    target[prop] = value;
    return true;
  }
};
export {
  $$,
  $
};
