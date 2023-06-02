# Query Jetpack Credentials Status

`<QueryJetpackCredentialsStatus />` is a React component that dispatches actions for testing Jetpack Credentials to determine whether they are still valid.

## Usage

Render the component, passing `siteId` and `role`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import QueryJetpackCredentialsStatus from 'calypso/components/data/query-jetpack-credentials-status';

export default function MyComponent( { siteId, role } ) {
	return (
		<>
			<QueryJetpackCredentialsStatus siteId={ siteId } role={ role } />
		</>
	);
}
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which Jetpack Credentials status should be requested.

### `role`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The credentials role we want to test. For example: "main", "alternate".
