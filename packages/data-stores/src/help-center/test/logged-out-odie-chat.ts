import { setLoggedOutOdieChat } from '../actions';
import reducer from '../reducer';
import { getLoggedOutOdieChat } from '../selectors';
import type { State } from '../reducer';
import type { LoggedOutOdieChat } from '../types';

const wpcomSession: LoggedOutOdieChat = {
	odieId: 123,
	sessionId: 'wpcom-session',
	botSlug: 'wpcom-workflow-chat_loggedout',
};

const wooSession: LoggedOutOdieChat = {
	odieId: 456,
	sessionId: 'woo-session',
	botSlug: 'woo-workflow-chat_loggedout',
};

describe( 'logged-out Odie chat persistence', () => {
	it( 'stores sessions by bot slug', () => {
		const wpcomState = reducer( undefined, setLoggedOutOdieChat( wpcomSession ) );
		const state = reducer( wpcomState, setLoggedOutOdieChat( wooSession ) );

		expect( getLoggedOutOdieChat( state, wpcomSession.botSlug ) ).toEqual( wpcomSession );
		expect( getLoggedOutOdieChat( state, wooSession.botSlug ) ).toEqual( wooSession );
	} );

	it( 'reads a persisted session from the legacy storage shape', () => {
		const legacyState = {
			...reducer( undefined, setLoggedOutOdieChat( undefined ) ),
			loggedOutOdieChat: wpcomSession,
		} as State;

		expect( getLoggedOutOdieChat( legacyState, wpcomSession.botSlug ) ).toEqual( wpcomSession );
		expect( getLoggedOutOdieChat( legacyState, wooSession.botSlug ) ).toBeUndefined();

		const migratedState = reducer( legacyState, setLoggedOutOdieChat( wooSession ) );

		expect( getLoggedOutOdieChat( migratedState, wpcomSession.botSlug ) ).toEqual( wpcomSession );
		expect( getLoggedOutOdieChat( migratedState, wooSession.botSlug ) ).toEqual( wooSession );
	} );
} );
