Query Title
===========

`<QueryTitle />` is a React component used in assigning a title to the global application state.

## Usage

Render the component, passing `title`. It does not accept any children, nor does it render any elements to the page.

Upon being rendered or updated, the application state and subsequently the page `<title>` element will be changed to reflect the new value.

```jsx
import React from 'react';
import QueryTitle from 'components/data/query-title';

export default function HomeSection() {
	return (
		<main>
			<QueryTitle title="Home" />
		</main>
	);
}
```

## Props

### `title`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>""</code></td></tr>
</table>

The title to be assigned to state.
