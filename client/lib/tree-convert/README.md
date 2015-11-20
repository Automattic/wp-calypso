tree-convert
============

## `index.js`

The `TreeConvert` class converts between a flat list and a tree structure. Upon construction, it accepts a `key` parameter that specifies which property of each flat list's item contains its ID (default is lowercase 'id').

### `treeify`

Given a flat list where each item has a `parent` property containing its parent item's ID, this method returns the tree equivalent of that list, where each item's children are nested in its `items` property.

### `untreeify`

Inverse operation of `treeify`.

### `sortItems`

Given a tree, sorts each item's children (found in its `items` property) by its (integer) `order` property.

### `removeOrderProperty`

Removes the `order` property from each item in the given tree.

## `tree-traverser.js`

This module provides a couple of methods for tree traversal, like applying a function to each tree node, finding a node by a predicate, or insertion and removal of nodes.
