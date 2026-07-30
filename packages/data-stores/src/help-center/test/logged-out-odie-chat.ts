/**
 * @jest-environment jsdom
 */

import { dispatch } from '@wordpress/data';
import {
	ONE_WEEK_PERSISTENCE_STORAGE_KEY,
	oneWeekPersistenceStorage,
} from '../../plugins/one-week-persistence-config';
import {
	consumeLoggedOutOdieChatHandoff,
	restorePersistedLoggedOutOdieChatState,
	setLoggedOutOdieChat,
} from '../actions';
import { register } from '../index';
import { getPersistedLoggedOutOdieChatState } from '../persistence';
import { loggedOutOdieChat, loggedOutOdieChatHandoffs, loggedOutOdieChats } from '../reducer';
import { getLoggedOutOdieChat, getPendingLoggedOutOdieChat } from '../selectors';
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
	beforeEach( () => {
		window.localStorage.clear();
	} );

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

	it( 'marks handoffs by bot slug', () => {
		const wpcomHandoffs = loggedOutOdieChatHandoffs(
			undefined,
			setLoggedOutOdieChat( wpcomSession, true )
		);
		const handoffs = loggedOutOdieChatHandoffs(
			wpcomHandoffs,
			setLoggedOutOdieChat( wooSession, true )
		);
		const state = {
			loggedOutOdieChats: {
				[ wpcomSession.botSlug ]: wpcomSession,
				[ wooSession.botSlug ]: wooSession,
			},
			loggedOutOdieChatHandoffs: handoffs,
		} as State;

		expect( getPendingLoggedOutOdieChat( state, wpcomSession.botSlug ) ).toEqual( wpcomSession );
		expect( getPendingLoggedOutOdieChat( state, wooSession.botSlug ) ).toEqual( wooSession );
	} );

	it( 'does not mark a session for handoff while logged in', () => {
		const handoffs = loggedOutOdieChatHandoffs( undefined, setLoggedOutOdieChat( wpcomSession ) );
		const state = {
			loggedOutOdieChats: {
				[ wpcomSession.botSlug ]: wpcomSession,
			},
			loggedOutOdieChatHandoffs: handoffs,
		} as State;

		expect( getPendingLoggedOutOdieChat( state, wpcomSession.botSlug ) ).toBeUndefined();
	} );

	it( 'keeps an existing handoff pending when its session is updated after login', () => {
		const pendingHandoffs = loggedOutOdieChatHandoffs(
			undefined,
			setLoggedOutOdieChat( wpcomSession, true )
		);
		const handoffs = loggedOutOdieChatHandoffs(
			pendingHandoffs,
			setLoggedOutOdieChat( { ...wpcomSession, odieId: 789 } )
		);

		expect( handoffs ).toEqual( {
			[ wpcomSession.botSlug ]: true,
		} );
	} );

	it( 'consumes only the requested handoff without removing either session', () => {
		const wpcomHandoffs = loggedOutOdieChatHandoffs(
			undefined,
			setLoggedOutOdieChat( wpcomSession, true )
		);
		const handoffs = loggedOutOdieChatHandoffs(
			wpcomHandoffs,
			setLoggedOutOdieChat( wooSession, true )
		);
		const remainingHandoffs = loggedOutOdieChatHandoffs(
			handoffs,
			consumeLoggedOutOdieChatHandoff( wpcomSession.botSlug )
		);
		const state = {
			loggedOutOdieChats: {
				[ wpcomSession.botSlug ]: wpcomSession,
				[ wooSession.botSlug ]: wooSession,
			},
			loggedOutOdieChatHandoffs: remainingHandoffs,
		} as State;

		expect( getPendingLoggedOutOdieChat( state, wpcomSession.botSlug ) ).toBeUndefined();
		expect( getPendingLoggedOutOdieChat( state, wooSession.botSlug ) ).toEqual( wooSession );
		expect( getLoggedOutOdieChat( state, wpcomSession.botSlug ) ).toEqual( wpcomSession );
		expect( getLoggedOutOdieChat( state, wooSession.botSlug ) ).toEqual( wooSession );
	} );

	it( 'normalizes persisted legacy chat shapes before restoring the store', () => {
		oneWeekPersistenceStorage.setItem(
			ONE_WEEK_PERSISTENCE_STORAGE_KEY,
			JSON.stringify( {
				'automattic/help-center': {
					loggedOutOdieChat: {
						[ wpcomSession.botSlug ]: wpcomSession,
					},
					loggedOutOdieChats: {
						[ wooSession.botSlug ]: wooSession,
					},
					loggedOutOdieChatHandoffs: {
						[ wpcomSession.botSlug ]: true,
						invalid: false,
					},
				},
			} )
		);

		const persistedState = getPersistedLoggedOutOdieChatState();

		expect( persistedState ).toEqual( {
			loggedOutOdieChat: undefined,
			loggedOutOdieChats: {
				[ wpcomSession.botSlug ]: wpcomSession,
				[ wooSession.botSlug ]: wooSession,
			},
			loggedOutOdieChatHandoffs: {
				[ wpcomSession.botSlug ]: true,
			},
		} );

		const action = restorePersistedLoggedOutOdieChatState( persistedState! );
		expect( loggedOutOdieChat( wooSession, action ) ).toBeUndefined();
		expect( loggedOutOdieChats( { stale: wpcomSession }, action ) ).toEqual(
			persistedState?.loggedOutOdieChats
		);
		expect( loggedOutOdieChatHandoffs( { stale: true }, action ) ).toEqual(
			persistedState?.loggedOutOdieChatHandoffs
		);
	} );

	it( 'persists sessions and handoffs through the Help Center store', () => {
		const storeKey = register();
		const storeDispatch = dispatch( storeKey ) as unknown as {
			consumeLoggedOutOdieChatHandoff: typeof consumeLoggedOutOdieChatHandoff;
			setLoggedOutOdieChat: typeof setLoggedOutOdieChat;
		};

		storeDispatch.setLoggedOutOdieChat( wpcomSession, true );

		const persistedWithHandoff = JSON.parse(
			window.localStorage.getItem( 'WPCOM_7_DAYS_PERSISTENCE' ) ?? '{}'
		);
		expect( persistedWithHandoff[ storeKey ].loggedOutOdieChats ).toEqual( {
			[ wpcomSession.botSlug ]: wpcomSession,
		} );
		expect( persistedWithHandoff[ storeKey ].loggedOutOdieChatHandoffs ).toEqual( {
			[ wpcomSession.botSlug ]: true,
		} );

		storeDispatch.consumeLoggedOutOdieChatHandoff( wpcomSession.botSlug );

		const persistedAfterHandoff = JSON.parse(
			window.localStorage.getItem( 'WPCOM_7_DAYS_PERSISTENCE' ) ?? '{}'
		);
		expect( persistedAfterHandoff[ storeKey ].loggedOutOdieChats ).toEqual( {
			[ wpcomSession.botSlug ]: wpcomSession,
		} );
		expect( persistedAfterHandoff[ storeKey ].loggedOutOdieChatHandoffs ).toBeUndefined();
	} );
} );
