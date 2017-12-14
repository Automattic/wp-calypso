# PostDiffViewer

PostDiffViewer is a block that can be used for visualizing changes (diffs) to a post, page or other body of content that comprises of a title and content.

## Usage

PostDiffViewer should be passed a 'diff' object containing an array of 'changes' to the title and an array of changes to the content. These changes might be additions, deletions or copies.
In the following example the changes represent an amended title and update to the post content:

```jsx
import PostDiffViewer from 'blocks/post-diff-viewer';
 
export default function PostDiffViewerExample() {
	const diff = {
		title: [
			{ op: 'copy', value: 'Bitcoin ' },
			{ op: 'del', value: 'climbs' },
			{ op: 'add', value: 'rockets' },
			{ op: 'copy', value: ' above previous high' },
			{ op: 'del', value: '.' },
			{ op: 'add', value: '!' },
		],
		content: [
			{ op: 'copy', value: 'Today the price of Bitcoin ' },
			{ op: 'del', value: 'climbed' },
			{ op: 'add', value: 'rocketed' },
			{ op: 'copy', value: ' to over ' },
			{ op: 'del', value: '$15000' },
			{ op: 'add', value: '$16000' },
			{
				op: 'copy',
				value:
					'.\n Experts believe this is a result of the influx of retail investors scrambling to get in on the action.',
			},
			{ op: 'copy', value: '\n But along with this ' },
			{ op: 'add', value: 'huge ' },
			{
				op: 'copy',
				value:
					'growth comes more criticism as more and more financial professionals warn that Bitcoin may be a bubble waiting to burst.',
			},
		],
	};

	return <PostDiffViewer diff={ diff } />;
}
```

## Props

PostDiffViewer only accepts a single 'diff' prop:

- `diff`: Two arrays of objects, one for the title and one for the body, representing a content change, of shape:
  - `op`: The type of operation, addition ('add'), deletion ('del') or copy ('copy')
  - `value`: The content that was either added, deleted or copied.
