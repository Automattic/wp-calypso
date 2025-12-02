import { registerStore } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import { registerPlugins } from '../plugins';
import { isE2ETest, isInSupportSession } from '../utils';
import { controls as wpcomRequestControls } from '../wpcom-request-controls';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import { isHelpCenterShown } from './resolvers';
import * as selectors from './selectors';
export type { State };

let isRegistered = false;

export function register(): typeof STORE_KEY {
	const enabledPersistedOpenState = ! isE2ETest() && ! isInSupportSession();

	registerPlugins();

	if ( ! isRegistered ) {
		registerStore( STORE_KEY, {
			actions,
			reducer,
			controls: { ...controls, ...wpcomRequestControls },
			selectors,
			persist: [ 'message', 'userDeclaredSite', 'userDeclaredSiteUrl', 'subject' ],
			// Don't persist the open state for e2e users, because parallel tests will start interfering with each other.
			resolvers: enabledPersistedOpenState ? { isHelpCenterShown } : undefined,
		} );
		isRegistered = true;
	}

	return STORE_KEY;
}

export type { HelpCenterSite } from './types';
