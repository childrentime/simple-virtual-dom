interface Move {
  index: number;
  item?: any;
  type: 0 | 1;
}

interface DiffResult {
  moves: Move[];
  children: any[];
}

interface KeyIndexAndFree {
  keyIndex: { [key: string]: number };
  free: any[];
}

/**
 * Diff two list in O(N).
 * @param oldList - Original List
 * @param newList - List After certain insertions, removes, or moves
 * @param key - Key to identify items
 * @return - {moves: <Array>}
 *         - moves is a list of actions that telling how to remove and insert
 */
function diff(oldList: any[], newList: any[], key: string | ((item: any) => string)): DiffResult {
  const oldMap = makeKeyIndexAndFree(oldList, key);
  const newMap = makeKeyIndexAndFree(newList, key);
  const newFree = newMap.free;
  const oldKeyIndex = oldMap.keyIndex;
  const newKeyIndex = newMap.keyIndex;
  const moves: Move[] = [];
  // a simulate list to manipulate
  const children: any[] = [];
  let i = 0;
  let item: any;
  let itemKey: string | undefined;
  let freeIndex = 0;

  // first pass to check item in old list: if it's removed or not
  while (i < oldList.length) {
    item = oldList[i];
    itemKey = getItemKey(item, key);
    if (itemKey) {
      if (!newKeyIndex.hasOwnProperty(itemKey)) {
        children.push(null);
      } else {
        const newItemIndex = newKeyIndex[itemKey];
        children.push(newList[newItemIndex]);
      }
    } else {
      const freeItem = newFree[freeIndex++];
      children.push(freeItem || null);
    }
    i++;
  }

  const simulateList = children.slice(0);

  // remove items no longer exist
  i = 0;
  while (i < simulateList.length) {
    if (simulateList[i] === null) {
      remove(i);
      removeSimulate(i);
    } else {
      i++;
    }
  }

  // i is cursor pointing to a item in new list
  // j is cursor pointing to a item in simulateList
  let j = 0;
  i = 0;
  while (i < newList.length) {
    item = newList[i];
    itemKey = getItemKey(item, key);
    const simulateItem = simulateList[j];
    const simulateItemKey = getItemKey(simulateItem, key);

    if (simulateItem) {
      if (itemKey === simulateItemKey) {
        j++;
      } else {
        // new item, just insert it
        if (!oldKeyIndex.hasOwnProperty(itemKey as string)) {
          insert(i, item);
        } else {
          // if remove current simulateItem make item in right place
          // then just remove it
          const nextItemKey = getItemKey(simulateList[j + 1], key);
          if (nextItemKey === itemKey) {
            remove(i);
            removeSimulate(j);
            j++; // after removing, current j is right, just jump to next one
          } else {
            // else insert item
            insert(i, item);
          }
        }
      }
    } else {
      insert(i, item);
    }
    i++;
  }

  // if j is not remove to the end, remove all the rest item
  let k = simulateList.length - j;
  while (j++ < simulateList.length) {
    k--;
    remove(k + i);
  }

  function remove(index: number) {
    const move: Move = { index: index, type: 0 };
    moves.push(move);
  }

  function insert(index: number, item: any) {
    const move: Move = { index: index, item: item, type: 1 };
    moves.push(move);
  }

  function removeSimulate(index: number) {
    simulateList.splice(index, 1);
  }

  return {
    moves: moves,
    children: children
  };
}

/**
 * Convert list to key-item keyIndex object.
 * @param list
 * @param key
 */
function makeKeyIndexAndFree(list: any[], key: string | ((item: any) => string)): KeyIndexAndFree {
  const keyIndex: { [key: string]: number } = {};
  const free: any[] = [];
  for (let i = 0, len = list.length; i < len; i++) {
    const item = list[i];
    const itemKey = getItemKey(item, key);
    if (itemKey) {
      keyIndex[itemKey] = i;
    } else {
      free.push(item);
    }
  }
  return {
    keyIndex: keyIndex,
    free: free
  };
}

function getItemKey(item: any, key: string | ((item: any) => string)): string | undefined {
  if (!item || !key) return undefined;
  return typeof key === 'string'
    ? item[key]
    : key(item);
}

export { makeKeyIndexAndFree, diff as listDiff };