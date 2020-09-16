# Editor Publish Date

Editor Publish Date is a React component that allows the user to set a post's publish date inside the Editor.

## Usage

```jsx
import EditorPublishDate from 'post-editor/editor-publish-date';

export default function MyComponent() {
	const props = {
		post: post,
		setPostDate: setPostDate,
	};

	return (
		<EditorPublishDate { ...props } />
	);
}
```

## Props

The following props are used with the Editor Publish Date component:

- `post`: (object) The post object
- `setPostDate`: (func) A callback that receives a Moment object with the updated date on change
