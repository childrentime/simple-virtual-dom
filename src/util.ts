export function type(obj: any): string {
  return Object.prototype.toString.call(obj).replace(/\[object\s|\]/g, '');
}

export function isArray(list: any): boolean {
  return Array.isArray(list);
}

export function slice<T>(arrayLike: ArrayLike<T>, index?: number): T[] {
  return Array.prototype.slice.call(arrayLike, index);
}

export function truthy(value: any): boolean {
  return Boolean(value);
}

export function isString(list: any): boolean {
  return typeof list === 'string';
}

export function each<T>(array: T[], fn: (item: T, index: number) => void): void {
  array.forEach(fn);
}

export function toArray<T>(listLike: ArrayLike<T>): T[] {
  if (!listLike) {
    return [];
  }
  return Array.from(listLike);
}

export function setAttr(node: HTMLElement, key: string, value: string): void {
  switch (key) {
    case 'style':
      node.style.cssText = value;
      break;
    case 'value':
      const tagName = node.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea') {
        (node as HTMLInputElement | HTMLTextAreaElement).value = value;
      } else {
        node.setAttribute(key, value);
      }
      break;
    default:
      node.setAttribute(key, value);
      break;
  }
}