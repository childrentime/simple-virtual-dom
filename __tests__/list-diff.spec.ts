import { describe, it, expect } from 'vitest';
import { listDiff, makeKeyIndexAndFree } from '../src/list-diff';

describe('list-diff', () => {
  describe('makeKeyIndexAndFree', () => {
    it('should create key index and free list correctly', () => {
      const list = [
        { key: 'a' },
        { key: 'b' },
        { },
        { key: 'c' },
        { }
      ];
      const result = makeKeyIndexAndFree(list, 'key');
      
      expect(result.keyIndex).toEqual({
        'a': 0,
        'b': 1,
        'c': 3
      });
      expect(result.free).toHaveLength(2);
      expect(result.free[0]).toEqual({});
      expect(result.free[1]).toEqual({});
    });

    it('should handle empty list', () => {
      const result = makeKeyIndexAndFree([], 'key');
      expect(result.keyIndex).toEqual({});
      expect(result.free).toEqual([]);
    });

    it('should handle list with no keys', () => {
      const list = [{}, {}, {}];
      const result = makeKeyIndexAndFree(list, 'key');
      expect(result.keyIndex).toEqual({});
      expect(result.free).toEqual(list);
    });

    it('should work with a function as key', () => {
      const list = [
        { id: 'a' },
        { id: 'b' },
        { id: 'c' }
      ];
      const result = makeKeyIndexAndFree(list, item => item.id);
      expect(result.keyIndex).toEqual({
        'a': 0,
        'b': 1,
        'c': 2
      });
      expect(result.free).toEqual([]);
    });
  });

  describe('listDiff', () => {
    it('should detect insertion', () => {
      const oldList = [{ key: 'a' }, { key: 'b' }, { key: 'c' }];
      const newList = [{ key: 'a' }, { key: 'b' }, { key: 'd' }, { key: 'c' }];
      const result = listDiff(oldList, newList, 'key');
      
      expect(result.moves).toEqual([
        { type: 1, index: 2, item: { key: 'd' } }
      ]);
      expect(result.children).toEqual([
        { key: 'a' },
        { key: 'b' },
        { key: 'c' }
      ]);
    });

    it('should detect removal', () => {
      const oldList = [{ key: 'a' }, { key: 'b' }, { key: 'c' }];
      const newList = [{ key: 'a' }, { key: 'c' }];
      const result = listDiff(oldList, newList, 'key');
      
      expect(result.moves).toEqual([
        { type: 0, index: 1 }
      ]);
      expect(result.children).toEqual([
        { key: 'a' },
        null,
        { key: 'c' }
      ]);
    });

    it('should detect reorder', () => {
      const oldList = [{ key: 'a' }, { key: 'b' }, { key: 'c' }];
      const newList = [{ key: 'c' }, { key: 'a' }, { key: 'b' }];
      const result = listDiff(oldList, newList, 'key');
      
      expect(result.moves).toEqual([
        { type: 1, index: 0, item: { key: 'c' } },
        { type: 0, index: 3 }
      ]);
      expect(result.children).toEqual([
        { key: 'a' },
        { key: 'b' },
        { key: 'c' }
      ]);
    });

    it('should handle empty oldList', () => {
      const oldList: any[] = [];
      const newList = [{ key: 'a' }, { key: 'b' }];
      const result = listDiff(oldList, newList, 'key');
      
      expect(result.moves).toEqual([
        { type: 1, index: 0, item: { key: 'a' } },
        { type: 1, index: 1, item: { key: 'b' } }
      ]);
      expect(result.children).toEqual([]);
    });

    it('should handle empty newList', () => {
      const oldList = [{ key: 'a' }, { key: 'b' }];
      const newList: any[] = [];
      const result = listDiff(oldList, newList, 'key');
      
      expect(result.moves).toEqual([
        { type: 0, index: 0 },
        { type: 0, index: 0 }
      ]);
      expect(result.children).toEqual([null, null]);
    });
  
    it('should handle lists with no keys', () => {
      const oldList = ['a', 'b', 'c'];
      const newList = ['b', 'a', 'd'];
      const result = listDiff(oldList, newList, (item) => item);
      
      expect(result.moves).toEqual([
        { type: 0, index: 2 },
        { type: 0, index: 0 },
        { type: 1, index: 1, item: 'a' },
        { type: 1, index: 2, item: 'd' }
      ]);
      expect(result.children).toEqual(['a', 'b', null]);
    });

    it('should handle complex scenario', () => {
      const oldList = [{ key: 'a' }, { key: 'b' }, { key: 'c' }, { key: 'd' }, { key: 'e' }];
      const newList = [{ key: 'c' }, { key: 'd' }, { key: 'a' }, { key: 'g' }, { key: 'e' }];
      const result = listDiff(oldList, newList, 'key');
      
      expect(result.moves).toEqual([
        { index: 1, type: 0 },
        { index: 0, type: 0 },
        { index: 2, item: { key: 'a' }, type: 1 },
        { index: 3, item: { key: 'g' }, type: 1 }
      ]);
      expect(result.children).toEqual([
        { key: 'a' },
        null,
        { key: 'c' },
        { key: 'd' },
        { key: 'e' }
      ]);
    });
  });
});