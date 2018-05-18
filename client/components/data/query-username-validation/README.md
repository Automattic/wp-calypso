Query Username Validation
=========================

`<QueryUsernameValidation />` is a React component used in managing network requests for validating if a username is valid to be used.

## Usage

Render the component, passing `username`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryUsernameValidation from 'components/data/query-username-validation';
import MyPostsListItem from './list-item';

export default function UsernameValidationResults( { username } ) {
	return (
		<div>
			<QueryUsernameValidation username="mynewusername" />
			{ JSON.stringify(username.validation) }
		</div>
	);
}
```

## Props

### `username`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>null</code></td></tr>
</table>

The username to be validated.
