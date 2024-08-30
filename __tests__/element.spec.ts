import { describe, it, expect } from 'vitest';
import { Element, createElement } from '../src/element';

describe('Element', () => {
  describe('constructor', () => {
    it('should create an Element with tagName, props, and children', () => {
      const el = new Element('div', { id: 'test' }, ['Hello']);
      expect(el.tagName).toBe('div');
      expect(el.props).toEqual({ id: 'test' });
      expect(el.children).toEqual(['Hello']);
    });

    it('should handle empty props and children', () => {
      const el = new Element('span', {}, []);
      expect(el.tagName).toBe('span');
      expect(el.props).toEqual({});
      expect(el.children).toEqual([]);
    });

    it('should set key if provided in props', () => {
      const el = new Element('p', { key: 'myKey' }, []);
      expect(el.key).toBe('myKey');
    });

    it('should calculate count correctly for string children', () => {
      const el = new Element('div', {}, ['Hello', 'World']);
      expect(el.count).toBe(2);
    });

    it('should calculate count correctly for nested Elements', () => {
      const child = new Element('span', {}, ['Child']);
      const el = new Element('div', {}, [child, 'Text']);
      expect(el.count).toBe(3); // 1 for child Element, 1 for child's text, 1 for 'Text'
    });
  });

  describe('render', () => {
    it('should render a simple element', () => {
      const el = new Element('div', { id: 'test' }, ['Hello']);
      const rendered = el.render();
      expect(rendered.tagName.toLowerCase()).toBe('div');
      expect(rendered.id).toBe('test');
      expect(rendered.textContent).toBe('Hello');
    });

    it('should render nested elements', () => {
      const child = new Element('span', { class: 'child' }, ['Child']);
      const el = new Element('div', { id: 'parent' }, [child, 'Text']);
      const rendered = el.render();
      expect(rendered.tagName.toLowerCase()).toBe('div');
      expect(rendered.id).toBe('parent');
      expect(rendered.childNodes.length).toBe(2);
      //@ts-ignore
      expect(rendered.firstChild?.tagName.toLowerCase()).toBe('span');
      expect(rendered.firstChild?.textContent).toBe('Child');
      expect(rendered.lastChild?.textContent).toBe('Text');
    });

    it('should handle empty children', () => {
      const el = new Element('br', {}, []);
      const rendered = el.render();
      expect(rendered.tagName.toLowerCase()).toBe('br');
      expect(rendered.childNodes.length).toBe(0);
    });

    it('should set attributes correctly', () => {
      const el = new Element('input', { type: 'text', value: 'test', disabled: true }, []);
      const rendered = el.render();
      expect(rendered.tagName.toLowerCase()).toBe('input');
      expect(rendered.getAttribute('type')).toBe('text');
      expect((rendered as HTMLInputElement).value).toBe('test');
      expect(rendered.getAttribute('disabled')).toBe('true');
    });
  });
});

describe('createElement', () => {
  it('should create an Element with tagName, props, and children', () => {
    const el = createElement('div', { id: 'test' }, ['Hello']);
    expect(el).toBeInstanceOf(Element);
    expect(el.tagName).toBe('div');
    expect(el.props).toEqual({ id: 'test' });
    expect(el.children).toEqual(['Hello']);
  });

  it('should handle props as children when no children are provided', () => {
    const el = createElement('span', ['Text']);
    expect(el.props).toEqual({});
    expect(el.children).toEqual(['Text']);
  });

  it('should handle null props', () => {
    const el = createElement('p', null, ['Content']);
    expect(el.props).toEqual({});
    expect(el.children).toEqual(['Content']);
  });

  it('should wrap single child in an array', () => {
    const el = createElement('div', {}, 'Single Child');
    expect(el.children).toEqual(['Single Child']);
  });

  it('should handle empty children', () => {
    const el = createElement('br');
    expect(el.children).toEqual([]);
  });

  it('should handle nested Elements as children', () => {
    const child = createElement('span', {}, 'Child');
    const el = createElement('div', {}, [child, 'Text']);
    expect(el.children[0]).toBeInstanceOf(Element);
    expect(el.children[1]).toBe('Text');
  });
});