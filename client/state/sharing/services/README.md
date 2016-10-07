Keyring Services
================

A module for managing srevices that offer keyring connections.

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `requestKeyringServices()`

Get a list of keyring services.

```js
import { connect } from 'react-redux';
import { isKeyringServicesFetching } from 'state/sharing/services/selectors';
import { requestKeyringServices } from 'state/sharing/services/actions';

class QueryKeyringServices extends Component {
	componentWillMount() {
		if ( ! this.props.isRequesting ) {
			this.props.requestKeyringServices();
		}
	}

	render() { return null; }
}

export default connect(
	( state ) => ( { isRequesting: isKeyringServicesFetching( state ) } ),
	{ requestKeyringServices }
)( QueryKeyringServices );
```

## Reducer

Data from the aforementioned actions is added to the global state tree, under `sharing.services`, with the following structure:

```js
state.sharing.services = {
	items: {
		facebook: { ... },
		twitter: { ... },
		eventbrite: { ... },
		...
	},
	isFetching: true
}
```

## Selectors

Selectors are intended to assist in extracting data from the global state tree for consumption by other modules.

#### `getKeyringServices( state: object )`

Returns an array of keyring services.

```js
import { getKeyringServices } from 'state/sharing/services/selectors';

const services = getKeyringServices( state );
```

#### `getKeyringServicesByType( state: object, type: string )`

Returns an array of keyring services with the specified type.

```js
import { getKeyringServicesByType } from 'state/sharing/services/selectors';

const publiciseServices = getKeyringServicesByType( state, 'publicize' );
```

#### `getEligibleKeyringServices( state: object, site: object , type: string  )`

Returns an array of eligible keyring services with the specified type.

```js
import { getEligibleKeyringServices } from 'state/sharing/services/selectors';
import sites from 'lib/sites-list';

const eligibleServices = getEligibleKeyringServices( state, sites().getSelectedSite(), 'publicize' );
```

#### `isKeyringServicesFetching( state: object )`

Returns true if keyring services are currently being requested.

```js
import { isKeyringServicesFetching } from 'state/sharing/services/selectors';

const isRequesting = isKeyringServicesFetching( state );
```