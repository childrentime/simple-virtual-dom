import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { patch } from '../src/patch';
import { Element } from '../src/element';

describe('patch', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should apply TEXT patch', () => {
    const node = document.createTextNode('Hello');
    container.appendChild(node);

    patch(node, {
      0: [{ type: patch.TEXT, content: 'World' }]
    });

    expect(node.textContent).toBe('World');
  });

  it('should apply PROPS patch', () => {
    const node = document.createElement('div');
    container.appendChild(node);

    patch(node, {
      0: [{ type: patch.PROPS, props: { id: 'test', class: 'new-class' } }]
    });

    expect(node.id).toBe('test');
    expect(node.className).toBe('new-class');
  });

  it('should apply REPLACE patch', () => {
    const oldNode = document.createElement('div');
    container.appendChild(oldNode);

    const newElement = new Element('span', { id: 'new' }, ['New Content']);
    patch(oldNode, {
      0: [{ type: patch.REPLACE, node: newElement }]
    });

    const newNode = container.firstChild as HTMLElement;
    expect(newNode.tagName.toLowerCase()).toBe('span');
    expect(newNode.id).toBe('new');
    expect(newNode.textContent).toBe('New Content');
  });

  it('should apply REORDER patch', () => {
    const parent = document.createElement('div');
    const child1 = document.createElement('span');
    child1.textContent = 'First';
    child1.setAttribute('key', 'first');
    const child2 = document.createElement('span');
    child2.textContent = 'Second';
    child2.setAttribute('key', 'second');
    parent.appendChild(child1);
    parent.appendChild(child2);
    container.appendChild(parent);

    patch(parent, {
      0: [{
        type: patch.REORDER,
        moves: [
          { index: 0, type: 0 },  // remove first child
          { index: 1, item: { key: 'first' }, type: 1 }  // insert it back at the end
        ]
      }]
    });

    expect(parent.children[0].textContent).toBe('Second');
    expect(parent.children[1].textContent).toBe('First');
  });

  it('should handle nested patches', () => {
    const parent = document.createElement('div');
    const child = document.createElement('span');
    child.textContent = 'Child';
    parent.appendChild(child);
    container.appendChild(parent);

    patch(parent, {
      0: [{ type: patch.PROPS, props: { id: 'parent' } }],
      1: [{ type: patch.TEXT, content: 'Updated Child' }]
    });

    expect(parent.id).toBe('parent');
    expect(child.textContent).toBe('Updated Child');
  });

  it('should remove attribute when value is undefined', () => {
    const node = document.createElement('div');
    node.setAttribute('data-test', 'value');
    container.appendChild(node);

    patch(node, {
      0: [{ type: patch.PROPS, props: { 'data-test': undefined } }]
    });

    expect(node.hasAttribute('data-test')).toBe(false);
  });

  it('should handle style attribute', () => {
    const node = document.createElement('div');
    container.appendChild(node);

    patch(node, {
      0: [{ type: patch.PROPS, props: { style: 'color: red; font-size: 16px;' } }]
    });

    expect(node.style.color).toBe('red');
    expect(node.style.fontSize).toBe('16px');
  });

  it('should handle value attribute for input elements', () => {
    const input = document.createElement('input');
    container.appendChild(input);

    patch(input, {
      0: [{ type: patch.PROPS, props: { value: 'test value' } }]
    });

    expect((input as HTMLInputElement).value).toBe('test value');
  });
});