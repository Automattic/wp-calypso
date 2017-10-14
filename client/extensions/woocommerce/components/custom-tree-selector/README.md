Custom tree selection component. Renders checkboxes for each node in the tree.

Props:
```
nodes: Array of nodes described below. If absent, placeholders are rendered.
onNodeSelect: function( node, checked ), Default callback for checkbox clicks. Can be overridden by onSelect for a specific node.
```

CustomTreeSelector takes a `nodes` prop which is a JavaScript Object representation of the top-level tree nodes. While you may add whatever fields you like in each node in this object structure, there are a few fields which CustomTreeSelector cares about:

* `key [ string ]` (required): This is a string for React `key` props and therefore must be unique to this node amongst its sibling nodes.
* `label [ string ]` (required): This should be a translated string and is used for display purposes.
* `onSelect [ function( node, selected ) ]: If present, will be used as a callback for this specific node. If `null`, the checkbox/radio for this node will be omitted.
* `selected [boolean ]` (defaults to `false`): If present, will determine if the checkbox/radio is checked or selected.
* `children [ array ]`: If present, this will be iterated and rendered indented under this node.

Example tree object structure:

```js
[
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
]
```

