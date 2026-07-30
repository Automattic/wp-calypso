import { setLoggedOutOdieChat } from '../actions';
import { loggedOutOdieChat, loggedOutOdieChats } from '../reducer';
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
	it( 'stores sessions by bot slug while keeping the latest singular value', () => {
		const wpcomSessions = loggedOutOdieChats( undefined, setLoggedOutOdieChat( wpcomSession ) );
		const sessions = loggedOutOdieChats( wpcomSessions, setLoggedOutOdieChat( wooSession ) );
		const legacySession = loggedOutOdieChat( wpcomSession, setLoggedOutOdieChat( wooSession ) );
		const state = {
			loggedOutOdieChat: legacySession,
			loggedOutOdieChats: sessions,
		} as State;

		expect( getLoggedOutOdieChat( state, wpcomSession.botSlug ) ).toEqual( wpcomSession );
		expect( getLoggedOutOdieChat( state, wooSession.botSlug ) ).toEqual( wooSession );
		expect( state.loggedOutOdieChat ).toEqual( wooSession );
	} );

	it( 'reads a persisted session from the legacy storage shape', () => {
		const legacyState = {
			loggedOutOdieChat: wpcomSession,
		} as State;

		expect( getLoggedOutOdieChat( legacyState, wpcomSession.botSlug ) ).toEqual( wpcomSession );
		expect( getLoggedOutOdieChat( legacyState, wooSession.botSlug ) ).toBeUndefined();

		const migratedSessions = loggedOutOdieChats( undefined, setLoggedOutOdieChat( wooSession ) );
		const migratedState = {
			loggedOutOdieChat: wpcomSession,
			loggedOutOdieChats: migratedSessions,
		} as State;

		expect( getLoggedOutOdieChat( migratedState, wpcomSession.botSlug ) ).toEqual( wpcomSession );
		expect( getLoggedOutOdieChat( migratedState, wooSession.botSlug ) ).toEqual( wooSession );
	} );

	it( 'reads the temporary keyed shape from the singular storage field', () => {
		const state = {
			loggedOutOdieChat: {
				[ wpcomSession.botSlug ]: wpcomSession,
				[ wooSession.botSlug ]: wooSession,
			},
		} as State;

		expect( getLoggedOutOdieChat( state, wpcomSession.botSlug ) ).toEqual( wpcomSession );
		expect( getLoggedOutOdieChat( state, wooSession.botSlug ) ).toEqual( wooSession );
	} );
} );
