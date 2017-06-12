Editor Visibility
=================

Editor Visibility is a React component that allows the user to set a post's visibility (public, private, or password protected) inside the Editor.

## Usage

```jsx
import EditorVisibility from 'post-editor/editor-visibility';

export default function MyComponent() {
	const props = {
		siteId: 10,
		postId: 10,
		status: 'publish',
		onPrivatePublish: onPublish,
		isPrivateSite: false,
		type: 'post',
		password: 'password',
	};

	return (
		<EditorVisibility { ...props } />
	);
}
```

## Props

The following props are used with the Editor Visibility component:

- `siteId`: (int) ID of the current site
- `postId`: (int) ID of post being edited
- `status`: (string) the current post status
- `onPrivatePublish`: (func) Executed after a post is set to 'private'.
- `isPrivateSite`: (bool) Whether or not the current site is private.
- `type`: (string) The current post type.
- `password`: (string) A password for 'password' protected post. An empty string if not password protected.
- `savedStatus`: (string) Auto-save post status.
- `savedPassword`: (string) Auto-save post password for 'password' protected post.
