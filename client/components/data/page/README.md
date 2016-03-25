Page
====

_This is a work in progress: only `title` and `unreadCount` are functional in the current state._

`<Page />` is a React component used in assigning a title, description, unread count, link or meta to the global application state.

## Usage

Render the component, passing `title`, `description`, `unreadCount`, `link` or `meta`. It does not accept any children, nor does it render any elements to the page.

Upon being rendered or updated, the application state and subsequently the page `<title>`, `<meta>` and `<link>` elements will be changed to reflect the new values.

```jsx
import React from 'react';
import Page from 'components/data/page';

export default function HomeSection() {
	let count = 123;
	let metas = [ { rel: 'some-rel', content: 'some-content' } ];
	let links = [ { href: 'https://automattic.com', 'rel': 'some-rel' } ];

	return (
		<main>
			<Page title="Home" description="Lorem ipsum" link={ links } meta={ metas } unreadCount={ count } />
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
	<tr><th>Default</th><td>[]</td></tr>
</table>

### `link`

<table>
	<tr><th>Type</th><td>Array of objects</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td>[]</td></tr>
</table>
