Keyring Connections
===================

A module for managing keyring connections.

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `requestKeyringConnections( successCallback: function )`

Get a list of keyring connections.

```js
import { connect } from 'react-redux';
import { isKeyringConnectionsFetching } from 'state/sharing/keyring/selectors';
import { requestKeyringConnections } from 'state/sharing/keyring/actions';

class QueryKeyringConnections extends Component {
	componentWillMount() {
		if ( ! this.props.isRequesting ) {
			this.props.requestKeyringConnections();
		}
	}

	render() { return null; }
}

export default connect(
	( state ) => ( { isRequesting: isKeyringConnectionsFetching( state ) } ),
	{ requestKeyringConnections }
)( QueryKeyringConnections );
```

## Reducer

Data from the aforementioned actions is added to the global state tree, under `sharing.keyring`, with the following structure:

```js
state.sharing.keyring = {
	items: {
		1: { ID: 1, ... },
		2: { ID: 2, ... },
		3: { ID: 3, ... },
		...
	},
	isFetching: true
}
```

## Selectors

Selectors are intended to assist in extracting data from the global state tree for consumption by other modules.

#### `getKeyringConnections( state: object )`

Returns an array of keyring connection objects.

```js
import { getKeyringConnections } from 'state/sharing/keyring/selectors';

const connections = getKeyringConnections( state );
```

#### `getKeyringConnectionById( state: object, keyringConnectionId: number )`

Returns a keyring connection object with a specified ID.

```js
import { getKeyringConnectionById } from 'state/sharing/keyring/selectors';

const connection = getKeyringConnectionById( state, 23353);
```

#### `getKeyringConnectionsByName( state: object, service: string )`

Returns an array of keyring connection objects for a specified service.

```js
import { getKeyringConnectionsByName } from 'state/sharing/keyring/selectors';

const twitterConnections = getKeyringConnectionsByName( state, 'twitter' );
```

#### `getUserConnections( state: object,  userId: number  )`

Returns an array of keyring connection objects for a specific user.

```js
import { getUserConnections } from 'state/sharing/keyring/selectors';

const userConnections = getUserConnections( state, 344325 );
```

#### `isKeyringConnectionsFetching( state: object )`

Returns true if keyring connections are currently being requested.

```js
import { isKeyringConnectionsFetching } from 'state/sharing/keyring/selectors';

const isRequesting = isKeyringConnectionsFetching( state );
```
