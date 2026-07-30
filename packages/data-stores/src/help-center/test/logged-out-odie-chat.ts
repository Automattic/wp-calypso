/**
 * @jest-environment jsdom
 */

import { dispatch } from '@wordpress/data';
import { oneWeekPersistenceStorage } from '../../plugins/one-week-persistence-config';
import { consumeLoggedOutOdieChatHandoff, setLoggedOutOdieChat } from '../actions';
import { register } from '../index';
import { getLoggedOutOdieChatHandoffSessions } from '../persistence';
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
		window.sessionStorage.clear();
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

	it( 'restores only a pending logged-out chat after the login storage reset', () => {
		const storeKey = register();
		const persistedSession = {
			[ storeKey ]: {
				loggedOutOdieChat: wpcomSession,
				loggedOutOdieChats: {
					[ wpcomSession.botSlug ]: wpcomSession,
				},
				loggedOutOdieChatHandoffs: {
					[ wpcomSession.botSlug ]: true,
				},
				message: 'do not restore',
			},
			'another/store': {
				value: 'do not restore',
			},
		};
		oneWeekPersistenceStorage.setItem(
			'WPCOM_7_DAYS_PERSISTENCE',
			JSON.stringify( persistedSession )
		);

		window.localStorage.clear();
		const staleSession = {
			...wpcomSession,
			odieId: 999,
			sessionId: 'stale-session',
		};
		window.localStorage.setItem(
			'WPCOM_7_DAYS_PERSISTENCE',
			JSON.stringify( {
				[ storeKey ]: {
					loggedOutOdieChat: staleSession,
					loggedOutOdieChats: {
						[ staleSession.botSlug ]: staleSession,
					},
					message: 'keep current store state',
				},
				'another/store': {
					value: 'keep current store state',
				},
			} )
		);
		window.localStorage.setItem( 'WPCOM_7_DAYS_PERSISTENCE_TS', JSON.stringify( Date.now() ) );

		const restoredState = JSON.parse(
			oneWeekPersistenceStorage.getItem( 'WPCOM_7_DAYS_PERSISTENCE' ) ?? '{}'
		);
		expect( restoredState ).toEqual( {
			[ storeKey ]: {
				loggedOutOdieChat: wpcomSession,
				loggedOutOdieChats: {
					[ wpcomSession.botSlug ]: wpcomSession,
				},
				loggedOutOdieChatHandoffs: {
					[ wpcomSession.botSlug ]: true,
				},
				message: 'keep current store state',
			},
			'another/store': {
				value: 'keep current store state',
			},
		} );
		expect( getLoggedOutOdieChatHandoffSessions() ).toEqual( [ wpcomSession ] );

		oneWeekPersistenceStorage.setItem(
			'WPCOM_7_DAYS_PERSISTENCE',
			JSON.stringify( {
				[ storeKey ]: {
					loggedOutOdieChat: wpcomSession,
					loggedOutOdieChats: {
						[ wpcomSession.botSlug ]: wpcomSession,
					},
				},
			} )
		);
		window.localStorage.clear();

		expect( oneWeekPersistenceStorage.getItem( 'WPCOM_7_DAYS_PERSISTENCE' ) ).toBeNull();
	} );
} );
