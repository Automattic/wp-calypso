DocumentHead
====

_This is a work in progress: only `title` and `unreadCount` are functional in the current state._

`<DocumentHead />` is a React component used in assigning a title, description, unread count, link or meta to the global application state.

## Usage

Render the component, passing `title`, `description`, `unreadCount`, `link` or `meta`. It does not accept any children, nor does it render any elements to the page.

```jsx
import React from 'react';
import DocumentHead from 'components/data/document-head';

export default function HomeSection() {
	let count = 123;
	let metas = [ { rel: 'some-rel', content: 'some-content' } ];
	let links = [ { href: 'https://automattic.com', 'rel': 'some-rel' } ];

	return (
		<main>
			<DocumentHead title="Home" description="Lorem ipsum" link={ links } meta={ metas } unreadCount={ count } />
		</main>
	);
}
```

## Props

### `title`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td>""</td></tr>
</table>

### `description`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td>""</td></tr>
</table>

### `unreadCount`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td>0</td></tr>
</table>

### `meta`

<table>
	<tr><th>Type</th><td>Array of objects</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

### `link`

<table>
	<tr><th>Type</th><td>Array of objects</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>
