import { each, setAttr } from "./util";

interface Props {
  [key: string]: any;
  key?: string | number;
}

class Element {
  tagName: string;
  props: Props;
  children: (Element | string)[];
  key: string | number | undefined;
  count: number;

  constructor(tagName: string, props: Props, children: (Element | string)[]) {
    this.tagName = tagName;
    this.props = props || {};
    this.children = children || [];
    this.key = props ? props.key : undefined;

    let count = 0;
    each(this.children, (child, i) => {
      if (child instanceof Element) {
        count += child.count;
      } else {
        this.children[i] = "" + child;
      }
      count++;
    });

    this.count = count;
  }

  render(): HTMLElement {
    const el = document.createElement(this.tagName);
    const props = this.props;

    for (const propName in props) {
      if (props.hasOwnProperty(propName)) {
        const propValue = props[propName];
        console.log(el, propName, propValue);
        setAttr(el, propName, propValue);
      }
    }

    each(this.children, (child) => {
      const childEl =
        child instanceof Element
          ? child.render()
          : document.createTextNode(child as string);
      el.appendChild(childEl);
    });

    return el;
  }
}

function createElement(
  tagName: string,
  props?: Props | null,
  children?: (Element | string)[] | (Element | string)
): Element {
  if (Array.isArray(props)) {
    children = props;
    props = {};
  }

  // If children is not an array, wrap it in an array
  if (!Array.isArray(children)) {
    children = children ? [children] : [];
  }

  // If props is null, initialize it as an empty object
  props = props || {};

  return new Element(tagName, props, children);
}

export { Element, createElement };
