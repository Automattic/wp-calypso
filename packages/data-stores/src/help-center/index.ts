import { registerStore } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import { registerPlugins } from '../plugins';
import { isE2ETest, isInSupportSession } from '../utils';
import { controls as wpcomRequestControls } from '../wpcom-request-controls';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import { getLoggedOutOdieChatHandoffSessions } from './persistence';
import reducer, { State } from './reducer';
import * as resolvers from './resolvers';
import * as selectors from './selectors';
export type { State };

let isRegistered = false;

export function register(): typeof STORE_KEY {
	const enabledPersistedOpenState = ! isE2ETest() && ! isInSupportSession();

	registerPlugins();

	if ( ! isRegistered ) {
		const store = registerStore( STORE_KEY, {
			actions,
			reducer,
			controls: { ...controls, ...wpcomRequestControls },
			selectors,
			persist: [
				'message',
				'userDeclaredSite',
				'userDeclaredSiteUrl',
				'subject',
				'loggedOutOdieChat',
				'loggedOutOdieChats',
				'loggedOutOdieChatHandoffs',
			],
			// Don't persist the open state for e2e users, because parallel tests will start interfering with each other.
			resolvers: enabledPersistedOpenState ? resolvers : undefined,
		} );

		// The store may already exist before this bundle loads, so replay a pending login handoff.
		for ( const session of getLoggedOutOdieChatHandoffSessions() ) {
			store.dispatch( actions.setLoggedOutOdieChat( session, true ) );
		}

		isRegistered = true;
	}

	return STORE_KEY;
}

export { setHelpCenterAppId } from './utils';
export type { HelpCenterSite } from './types';
