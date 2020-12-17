# QueryUserSettings

`<QueryUserSettings />` is a React component used in managing network requests for current user's settings.

## Usage

Render the component. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import { useSelector } from 'react-redux';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import { getUserSettings } from 'calypso/state/selectors/get-user-settings';

export default function CurrentUser() {
	const userSettings = useSelector( ( state ) => getUserSettings( state ) );
	const loginName = userSettings?.login_name;

	return (
		<div>
			<QueryUserSettings />

			<p>Current user: { loginName }</p>
		</div>
	);
}
```