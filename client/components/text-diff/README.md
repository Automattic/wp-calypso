# TextDiff

<img width="183" alt="textdiff-example" src="https://user-images.githubusercontent.com/4335450/33998736-5a0a274c-e0e0-11e7-97a2-bb0b8cc4c77b.png">

TextDiff is a component useful for visualizing changes (diffs) to bodies of text.

## Usage

TextDiff should be passed an array of 'changes'. These changes might be additions, deletions or copies.
In the following example the changes array represents a title rename by including the deletion of the old title and addition of a new title:

```jsx
import TextDiff from 'components/text-diff';

export default function RenamedTitle() {
	const changes = [ {
		op: 'del',
		value: 'Old Title.',
	}, {
		op: 'add',
		value: 'New Title!',
	} ];

	return (
		<h2>
			<TextDiff changes={ changes } />
		</h2>
	);
}
```

## Props

The following props are available to customize the accordion:

- `changes`: An array of objects representing a content change, of shape:
  - `op`: The type of operation, addition ('add'), deletion ('del') or copy ('copy')
  - `value`: The content that was either added, deleted or copied.
- `splitLines`: Boolean indicating whether the changes should be broken out on to new lines or not.
