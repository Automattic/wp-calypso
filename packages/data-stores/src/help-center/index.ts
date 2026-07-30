import { registerStore } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import { registerPlugins } from '../plugins';
import { isE2ETest, isInSupportSession } from '../utils';
import { controls as wpcomRequestControls } from '../wpcom-request-controls';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import { getPersistedLoggedOutOdieChatState } from './persistence';
import reducer, { State } from './reducer';
import * as resolvers from './resolvers';
import * as selectors from './selectors';
export type { State };

let isRegistered = false;

export function register(): typeof STORE_KEY {
	const enabledPersistedOpenState = ! isE2ETest() && ! isInSupportSession();

	registerPlugins();

	if ( ! isRegistered ) {
		const persistedLoggedOutChatState = getPersistedLoggedOutOdieChatState();
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

		// Independently deployed bundles can stack persistence plugins with stale cached state.
		// Restore through the store after registration so this adapter's persisted chat state wins.
		store.dispatch( actions.restorePersistedLoggedOutOdieChatState( persistedLoggedOutChatState ) );

		isRegistered = true;
	}

	return STORE_KEY;
}

export { setHelpCenterAppId } from './utils';
export type { HelpCenterSite } from './types';
