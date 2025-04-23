# Network connection

A module that provides helpers for detecting and handling network connectivity (online/offline state).

It leverages the browser's built-in `navigator.onLine` property and event listeners to provide real-time updates about connectivity changes.

## API

### `useNetworkConnection()`

A React hook that returns the current online status of the user.

#### Returns

Object with the following properties:

- `isOnline` (boolean): `true` if the user is currently online, `false` otherwise.

#### Example

```jsx
import { useNetworkConnection } from 'calypso/lib/network-connection';

function MyComponent() {
	const { isOnline } = useNetworkConnection();

	return (
		<div>{ isOnline ? 'You are online!' : 'You are offline. Please check your connection.' }</div>
	);
}
```
