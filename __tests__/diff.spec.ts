import { describe, it, expect } from 'vitest';
import { diff } from '../src/diff';
import { Element } from '../src/element';
import { patch } from '../src/patch';

describe('diff', () => {
  it('should return empty patches for identical trees', () => {
    const tree = new Element('div', {}, [new Element('span', {}, ['Hello'])]);
    const patches = diff(tree, tree);
    expect(Object.keys(patches).length).toBe(0);
  });

  it('should detect text changes', () => {
    const oldTree = new Element('div', {}, ['Hello']);
    const newTree = new Element('div', {}, ['World']);
    const patches = diff(oldTree, newTree);
    expect(patches[1]).toEqual([{ type: patch.TEXT, content: 'World' }]);
  });

  it('should detect prop changes', () => {
    const oldTree = new Element('div', { class: 'old' }, []);
    const newTree = new Element('div', { class: 'new' }, []);
    const patches = diff(oldTree, newTree);
    expect(patches[0]).toEqual([{ type: patch.PROPS, props: { class: 'new' } }]);
  });

  it('should detect node replacement', () => {
    const oldTree = new Element('div', {}, []);
    const newTree = new Element('span', {}, []);
    const patches = diff(oldTree, newTree);
    expect(patches[0]).toEqual([{ type: patch.REPLACE, node: newTree }]);
  });

  it('should detect child insertion', () => {
    const oldTree = new Element('div', {}, []);
    const newTree = new Element('div', {}, [new Element('span', {}, [])]);
    const patches = diff(oldTree, newTree);
    expect(patches[0]).toEqual([{ 
      type: patch.REORDER, 
      moves: [{ index: 0, item: newTree.children[0], type: 1 }] 
    }]);
  });

  it('should detect child removal', () => {
    const oldTree = new Element('div', {}, [new Element('span', {}, [])]);
    const newTree = new Element('div', {}, []);
    const patches = diff(oldTree, newTree);
    expect(patches[0]).toEqual([{ 
      type: patch.REORDER, 
      moves: [{ index: 0, type: 0 }] 
    }]);
  });

  it('should handle complex nested changes', () => {
    const oldTree = new Element('div', {}, [
      new Element('span', { key: 'a' }, ['A']),
      new Element('span', { key: 'b' }, ['B']),
      new Element('span', { key: 'c' }, ['C'])
    ]);
    const newTree = new Element('div', {}, [
      new Element('span', { key: 'b' }, ['B']),
      new Element('span', { key: 'd' }, ['D']),
      new Element('span', { key: 'a' }, ['A2'])
    ]);
    const patches = diff(oldTree, newTree);
    
    expect(patches).toEqual({
      '0': [{ type: patch.REORDER, moves: expect.any(Array) }],
      '2': [{ type: patch.TEXT, content: 'A2' }]
    });
  });

  it('should handle ignored children', () => {
    const oldTree = new Element('div', { ignore: true }, [
      new Element('span', {}, ['Ignored'])
    ]);
    const newTree = new Element('div', { ignore: true }, [
      new Element('p', {}, ['New Ignored'])
    ]);
    const patches = diff(oldTree, newTree);
    expect(Object.keys(patches).length).toBe(0);
  });

  it('should handle null new node', () => {
    const oldTree = new Element('div', {}, []);
    const patches = diff(oldTree, null as any);
    expect(Object.keys(patches).length).toBe(0);
  });
});