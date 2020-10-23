# DocumentHead

`<DocumentHead />` is a React component used in assigning a title, unread count, link, or meta to the global application state. It also sets `document.title` on the client, based on those parameters.

## Usage

Render the component, passing `title`, `skipTitleFormatting`, `unreadCount`, `link` or `meta`. It does not accept any children, nor does it render any elements to the page.

```jsx
import React from 'react';
import DocumentHead from 'calypso/components/data/document-head';

export default function HomeSection() {
	const count = 123;
	const metas = [ { rel: 'some-rel', content: 'some-content' } ];
	const links = [ { href: 'https://automattic.com', rel: 'some-rel' } ];

	return (
		<main>
			<DocumentHead title="Home" link={ links } meta={ metas } unreadCount={ count } />
		</main>
	);
}
```

## Props

### `title`

The window title will be formatted using the `title` property plus some other internal application state (like the application name, or the number of unread messages). Pass `skipTitleFormatting=true` if you want to set the window title without any extra formatting.

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td>""</td></tr>
</table>

### `skipTitleFormatting`

<table>
	<tr><th>Type</th><td>Boolean</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td>false</td></tr>
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
