# TextDiff

TextDiff is a component useful for visualizing changes (diffs) to bodies of text.

## Usage

TextDiff should be passed an array of 'operations'. These operations might be additions, deletions or copies.
In the following example the operations array represents a title rename by including the deletion of the old title and addition of a new title:

```jsx
import TextDiff from 'calypso/components/text-diff';

export default function RenamedTitle() {
	const operations = [
		{
			op: 'del',
			value: 'Old Title.',
		},
		{
			op: 'add',
			value: 'New Title!',
		},
	];

	return (
		<h2>
			<TextDiff operations={ operations } />
		</h2>
	);
}
```

## Props

The following props are available to customize the text-diff:

- `operations`: An array of objects representing a content change, of shape:
  - `op`: The type of operation, addition ('add'), deletion ('del') or copy ('copy')
  - `value`: The content that was either added, deleted or copied.
- `splitLines`: Boolean indicating whether the changes should be broken out on to new lines or not.
