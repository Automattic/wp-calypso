DocumentHead
============

`<DocumentHead />` is a React component used in assigning a title, link, or meta to the global application state. It also sets `document.title` on the client, based on those parameters.

## Usage

Render the component, passing `title`, `link`, or `meta`. It does not accept any children, nor does it render any elements to the page.

```jsx
import React from 'react';
import DocumentHead from 'components/data/document-head';

export default function HomeSection() {
	let metas = [ { rel: 'some-rel', content: 'some-content' } ];
	let links = [ { href: 'https://automattic.com', 'rel': 'some-rel' } ];

	return (
		<main>
			<DocumentHead title="Home" link={ links } meta={ metas } />
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
