# Keyring Services

A module for managing services that offer keyring connections.

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `requestKeyringServices()`

Get a list of keyring services.

```js
import { connect } from 'react-redux';
import { isKeyringServicesFetching } from 'calypso/state/sharing/services/selectors';
import { requestKeyringServices } from 'calypso/state/sharing/services/actions';

class QueryKeyringServices extends Component {
	componentWillMount() {
		if ( ! this.props.isRequesting ) {
			this.props.requestKeyringServices();
		}
	}

	render() {
		return null;
	}
}

export default connect( ( state ) => ( { isRequesting: isKeyringServicesFetching( state ) } ), {
	requestKeyringServices,
} )( QueryKeyringServices );
```

## Reducer

Data from the aforementioned actions is added to the global state tree, under `sharing.services`, with the following structure:

```js
state.sharing.services = {
	items: {
		facebook: {
			/*...*/
		},
		twitter: {
			/*...*/
		},
		/*...*/
	},
	isFetching: true,
};
```

## Selectors

Selectors are intended to assist in extracting data from the global state tree for consumption by other modules.

### `getKeyringServices( state: object )`

Returns an array of keyring services.

```js
import { getKeyringServices } from 'calypso/state/sharing/services/selectors';

const services = getKeyringServices( state );
```

### `getKeyringServicesByType( state: object, type: string )`

Returns an array of keyring services with the specified type.

```js
import { getKeyringServicesByType } from 'calypso/state/sharing/services/selectors';

const publiciseServices = getKeyringServicesByType( state, 'publicize' );
```

### `getEligibleKeyringServices( state: object, siteId: number, type: string )`

Returns an array of eligible keyring services with the specified type.

A service is eligible for a given site if

1. it's a Jetpack site and the service supports Jetpack,
2. the service requires an active Jetpack module and that module is active on that site,
3. the current user can publish posts in case of all publicize services.

```js
import { getEligibleKeyringServices } from 'calypso/state/sharing/services/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const eligibleServices = getEligibleKeyringServices(
	state,
	getSelectedSiteId( site ),
	'publicize'
);
```

### `isKeyringServicesFetching( state: object )`

Returns true if keyring services are currently being requested.

```js
import { isKeyringServicesFetching } from 'calypso/state/sharing/services/selectors';

const isRequesting = isKeyringServicesFetching( state );
```
