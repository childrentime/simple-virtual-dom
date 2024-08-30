import { describe, it, expect } from 'vitest';
import { type, isArray, slice, truthy, isString, each, toArray, setAttr } from '../src/util';

describe('util', () => {
  describe('type', () => {
    it('should return correct type for various inputs', () => {
      expect(type([])).toBe('Array');
      expect(type({})).toBe('Object');
      expect(type('')).toBe('String');
      expect(type(42)).toBe('Number');
      expect(type(true)).toBe('Boolean');
      expect(type(null)).toBe('Null');
      expect(type(undefined)).toBe('Undefined');
      expect(type(() => {})).toBe('Function');
    });
  });

  describe('isArray', () => {
    it('should correctly identify arrays', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray({})).toBe(false);
      expect(isArray('array')).toBe(false);
    });
  });

  describe('slice', () => {
    it('should return a sliced array', () => {
      const arr = [1, 2, 3, 4, 5];
      expect(slice(arr, 2)).toEqual([3, 4, 5]);
      expect(slice(arr)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should work with array-like objects', () => {
      function args() {
        return slice(arguments);
      }
      // @ts-ignore
      expect(args(1, 2, 3)).toEqual([1, 2, 3]);
    });
  });

  describe('truthy', () => {
    it('should return true for truthy values', () => {
      expect(truthy(true)).toBe(true);
      expect(truthy(1)).toBe(true);
      expect(truthy('string')).toBe(true);
      expect(truthy([])).toBe(true);
      expect(truthy({})).toBe(true);
    });

    it('should return false for falsy values', () => {
      expect(truthy(false)).toBe(false);
      expect(truthy(0)).toBe(false);
      expect(truthy('')).toBe(false);
      expect(truthy(null)).toBe(false);
      expect(truthy(undefined)).toBe(false);
    });
  });

  describe('isString', () => {
    it('should correctly identify strings', () => {
      expect(isString('')).toBe(true);
      expect(isString('hello')).toBe(true);
      expect(isString(String('hello'))).toBe(true);
      expect(isString(123)).toBe(false);
      expect(isString({})).toBe(false);
    });
  });

  describe('each', () => {
    it('should iterate over array elements', () => {
      const arr = [1, 2, 3];
      const result: number[] = [];
      each(arr, (item, index) => {
        result.push(item * index);
      });
      expect(result).toEqual([0, 2, 6]);
    });
  });

  describe('toArray', () => {
    it('should convert array-like objects to arrays', () => {
      function args() {
        return toArray(arguments);
      }
      // @ts-ignore
      expect(args(1, 2, 3)).toEqual([1, 2, 3]);
    });

    it('should return an empty array for falsy inputs', () => {
      // @ts-ignore
      expect(toArray(null)).toEqual([]);
      // @ts-ignore
      expect(toArray(undefined)).toEqual([]);
    });
  });

  describe('setAttr', () => {
    it('should set style attribute correctly', () => {
      const node = document.createElement('div');
      setAttr(node, 'style', 'color: red; font-size: 16px;');
      expect(node.style.color).toBe('red');
      expect(node.style.fontSize).toBe('16px');
    });

    it('should set value attribute correctly for input elements', () => {
      const input = document.createElement('input');
      setAttr(input, 'value', 'test value');
      expect(input.value).toBe('test value');
    });

    it('should set other attributes correctly', () => {
      const node = document.createElement('div');
      setAttr(node, 'id', 'test-id');
      expect(node.getAttribute('id')).toBe('test-id');
    });
  });
});