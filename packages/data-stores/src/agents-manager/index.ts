import { registerStore } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import { registerPlugins } from '../plugins';
import { isE2ETest } from '../utils';
import { controls as wpcomRequestControls } from '../wpcom-request-controls';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import { getAgentsManagerState } from './resolvers';
import * as selectors from './selectors';

export type { State };
export { persistAgentsManagerState } from './persist-state';

let isRegistered = false;

export function register(): typeof STORE_KEY {
	if ( isRegistered ) {
		return STORE_KEY;
	}

	registerPlugins();

	registerStore( STORE_KEY, {
		actions,
		reducer,
		controls: { ...controls, ...wpcomRequestControls },
		selectors,
		persist: [],
		// Don't restore persisted state for e2e users, because parallel tests will start interfering with each other.
		resolvers: isE2ETest() ? undefined : { getAgentsManagerState },
	} );

	isRegistered = true;

	return STORE_KEY;
}
