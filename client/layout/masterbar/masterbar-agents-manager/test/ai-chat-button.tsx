/**
 * @jest-environment jsdom
 */
import { closeAgentsManagerChat, openAgentsManagerChat } from '@automattic/agents-manager';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createReduxStore, dispatch, register } from '@wordpress/data';
import React from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import MasterbarAiChatButton from '../ai-chat-button';

type ChatState = { isOpen: boolean; isMinimized: boolean };

const TEST_STORE = 'automattic/agents-manager-test';

jest.mock( '@automattic/agents-manager', () => ( {
	AGENTS_MANAGER_STORE: 'automattic/agents-manager-test',
	closeAgentsManagerChat: jest.fn(),
	openAgentsManagerChat: jest.fn(),
} ) );
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

const testStore = createReduxStore( TEST_STORE, {
	reducer: (
		state: ChatState = { isOpen: false, isMinimized: false },
		action: { type: string; state?: ChatState }
	) => ( action.type === 'SET_STATE' ? { ...state, ...action.state } : state ),
	selectors: {
		getAgentsManagerState: ( state: ChatState ) => state,
	},
	actions: {
		setState: ( state: ChatState ) => ( { type: 'SET_STATE', state } ),
	},
} );
register( testStore );

const setChatState = ( state: ChatState ) => dispatch( testStore ).setState( state );

const render = () =>
	renderWithProvider( <MasterbarAiChatButton />, {
		reducers: { ui: () => ( { section: { name: 'test-section' } } ) },
	} );

describe( 'MasterbarAiChatButton', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	const activeStateCases: Array< [ string, ChatState, boolean ] > = [
		[ 'visible', { isOpen: true, isMinimized: false }, true ],
		[ 'minimized', { isOpen: true, isMinimized: true }, false ],
		[ 'closed', { isOpen: false, isMinimized: false }, false ],
	];

	it.each( activeStateCases )(
		'marks the button active only while the chat is %s',
		( _state, state, isActive ) => {
			setChatState( state );

			render();

			expect( screen.getByRole( 'button' ).classList.contains( 'is-active' ) ).toBe( isActive );
		}
	);

	it( 'closes the chat when clicked while the chat is showing', async () => {
		setChatState( { isOpen: true, isMinimized: false } );

		render();
		await userEvent.click( screen.getByRole( 'button' ) );

		expect( closeAgentsManagerChat ).toHaveBeenCalled();
		expect( openAgentsManagerChat ).not.toHaveBeenCalled();
	} );

	it( 'opens the chat when clicked while the chat is hidden', async () => {
		setChatState( { isOpen: false, isMinimized: false } );

		render();
		await userEvent.click( screen.getByRole( 'button' ) );

		expect( openAgentsManagerChat ).toHaveBeenCalled();
		expect( closeAgentsManagerChat ).not.toHaveBeenCalled();
	} );
} );
