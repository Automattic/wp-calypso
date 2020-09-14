# Editor Visibility

Editor Visibility is a React component that allows the user to set a post's visibility (public, private, or password protected) inside the Editor.

## Usage

```jsx
import EditorVisibility from 'post-editor/editor-visibility';

export default function MyComponent() {
	return (
		<EditorVisibility onPrivatePublish={ onPublish } context="post-settings" />
	);
}
```

## Props

The following props are used with the Editor Visibility component:

- `onPrivatePublish`: (func) Executed after a post is set to 'private'.
- `context`: (string) A string describing the context in which the component is being rendered. E.g., 'post-settings' or 'confirmation-sidebar'. The context is used when reporting analytics events.

The component is connected to Redux and there are additional props retrieved from the Redux store:

- `siteId`: (int) ID of the current site
- `postId`: (int) ID of post being edited
- `hasPost`: (bool) Whether the edited post has been loaded
- `status`: (string) the current post status
- `type`: (string) The current post type.
- `password`: (string) A password for 'password' protected post. An empty string if not password protected.
- `savedStatus`: (string) Auto-save post status.
- `savedPassword`: (string) Auto-save post password for 'password' protected post.
- `isPrivateSite`: (bool) Whether or not the current site is private.
