# Query Just In Time Message

`<QueryJITM />` is a React component used in fetching JITMs for the selected site.

## Usage

Render the component, passing `siteId`, `messagePath` and optional `sectionName`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which JITM data should be queried.

### `sectionName`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The section name for which JITM data should be queried. When this is set, JITMs are queried wherever section changes.

### `messagePath`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The messagePath of the JITMs you want to retreive.
