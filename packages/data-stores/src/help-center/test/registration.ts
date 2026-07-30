/**
 * @jest-environment jsdom
 */

jest.mock( '@wordpress/data', () => ( {
	combineReducers: jest.requireActual( 'redux' ).combineReducers,
	controls: {},
	registerStore: jest.fn(),
} ) );

jest.mock( '@wordpress/data-controls', () => ( {
	controls: {},
} ) );

jest.mock( '../../plugins', () => ( {
	registerPlugins: jest.fn(),
} ) );

import { registerStore } from '@wordpress/data';
import {
	ONE_WEEK_PERSISTENCE_STORAGE_KEY,
	oneWeekPersistenceStorage,
} from '../../plugins/one-week-persistence-config';
import { register } from '../index';
import type { LoggedOutOdieChat } from '../types';

const mockStoreDispatch = jest.fn();
const mockRegisterStore = registerStore as jest.Mock;

const session: LoggedOutOdieChat = {
	odieId: 123,
	sessionId: 'logged-out-session',
	botSlug: 'wpcom-workflow-chat_loggedout',
};

describe( 'Help Center store registration', () => {
	it( 'restores persisted chats after the persistence plugin stack registers the store', () => {
		mockRegisterStore.mockReturnValue( { dispatch: mockStoreDispatch } );

		oneWeekPersistenceStorage.setItem(
			ONE_WEEK_PERSISTENCE_STORAGE_KEY,
			JSON.stringify( {
				'automattic/help-center': {
					loggedOutOdieChat: session,
					loggedOutOdieChats: {
						[ session.botSlug ]: session,
					},
					loggedOutOdieChatHandoffs: {
						[ session.botSlug ]: true,
					},
				},
			} )
		);

		register();

		expect( mockStoreDispatch ).toHaveBeenCalledWith( {
			type: 'HELP_CENTER_RESTORE_PERSISTED_LOGGED_OUT_ODIE_CHAT_STATE',
			state: {
				loggedOutOdieChat: session,
				loggedOutOdieChats: {
					[ session.botSlug ]: session,
				},
				loggedOutOdieChatHandoffs: {
					[ session.botSlug ]: true,
				},
			},
		} );
		expect( mockStoreDispatch.mock.invocationCallOrder[ 0 ] ).toBeGreaterThan(
			mockRegisterStore.mock.invocationCallOrder[ 0 ]
		);
	} );
} );
