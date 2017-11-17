TreeSelector
============

TreeSelector is a tree selection component that can render a tree several levels
deep and allow for selection of items in that tree.

## Usage

```jsx
class YourComponent extends React.Component {
	onNodeSelect( node, selected ) {
		// Dispatch actions here to update the model.
	}

	generateTree() {
		// Use props/state to generate a tree node model here.
		// If generating the tree is resource intensive, you can
		// hold a reference to it and only update it on lifecycle events.
	}

	render() {
		const treeNodes = generateTree();

		return (
			<Card>
				<TreeSelector nodes={ treeNodes } onNodeSelect={ nodeSelect } />
			</Card>
		);
	}
}
```

## Props:

### `nodes`

An array of tree node model objects. Tree nodes described below.
If `nodes` is falsy (undefined, null, etc), placeholders are rendered for this
component instead.

### `onNodeSelect`

`function( node, selected )`
Default callback for tree node selection.
Can be overridden for individual nodes by setting `onSelect` on that node.

## Tree Node

Each tree node is a simple JavaScript object that represents either a branch or
leaf node in the tree. While you may add whatever additional properties to each
node object, the TreeSelector uses a few specific properties to render the tree:

### `key`
`string` (required)

For React `key` props and therefore must be unique to this node amongst its sibling nodes.

### `label`
`string` (required)

Should be a translated string and is used for display purposes.

### `onSelect`
`function( node, selected )`

If present, will be used as a callback for this specific node.
If `null`, the checkbox/radio for this node will be omitted.

### `selected`
`boolean` (defaults to `false`)

Determines if the checkbox/radio is checked or selected.

### `children`
`Array`

If present, will be iterated and rendered indented under this node.

## Example tree object structure:

```js
const treeNodes = [
	{
		key: 'all',
		label: 'All Nodes',
		onSelect: onSelectAll, // special callback for 'all nodes'.
		children: [
			{
				key: 'p1',
				label: 'Parent 1',
				value: parent1, // ignored by tree component, but passed back in callback.
				children: [
					{
						key: 'p1child1',
						label: 'Parent 1 First Child',
					},
					{
						key: 'p1child2',
						label: 'Parent 1 Second Child',
					},
				],
			},
			{
				key: 'p2',
				label: 'Parent 2',
				value: parent2, // ignored by tree component, but passed back in callback.
				children: [
					{
						key: 'p2child1',
						label: 'Parent 2 First Child',
					},
					{
						key: 'p2child2',
						label: 'Parent 2 Second Child (unselectable)',
						onSelect: null, // This makes the node unselectable.
					},
				],
			},
		],
	},
];
```

