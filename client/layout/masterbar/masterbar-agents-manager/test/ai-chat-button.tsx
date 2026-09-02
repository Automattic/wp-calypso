/**
 * @jest-environment jsdom
 */
import {
	closeAgentsManagerChat,
	openAgentsManagerChat,
	recordAgentsManagerTracksEvent,
	useAiChatEntryState,
} from '@automattic/agents-manager';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import MasterbarAiChatButton from '../ai-chat-button';

jest.mock( '@automattic/agents-manager', () => ( {
	AiChatEntryLabel: () => <span>Agent</span>,
	closeAgentsManagerChat: jest.fn(),
	openAgentsManagerChat: jest.fn(),
	recordAgentsManagerTracksEvent: jest.fn(),
	useAiChatEntryState: jest.fn(),
} ) );

const mockUseAiChatEntryState = useAiChatEntryState as jest.MockedFunction<
	typeof useAiChatEntryState
>;

const render = ( sectionName: string | null = 'test-section' ) =>
	renderWithProvider( <MasterbarAiChatButton />, {
		reducers: { ui: () => ( { section: { name: sectionName } } ) },
	} );

describe( 'MasterbarAiChatButton', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockUseAiChatEntryState.mockReturnValue( { isChatVisible: false, isLabelVisible: true } );
	} );

	it( 'renders the entry label in the button and stays unlit while the chat is hidden', () => {
		render();

		const button = screen.getByRole( 'button', { name: 'Ask AI' } );
		expect( button ).not.toHaveClass( 'is-active' );
		expect( button ).toContainElement( screen.getByText( 'Agent' ) );
	} );

	it( 'lights the button while the chat is visible', () => {
		mockUseAiChatEntryState.mockReturnValue( { isChatVisible: true, isLabelVisible: false } );

		render();

		expect( screen.getByRole( 'button', { name: 'Ask AI' } ) ).toHaveClass( 'is-active' );
	} );

	it( 'closes the chat when clicked while the chat is showing', async () => {
		mockUseAiChatEntryState.mockReturnValue( { isChatVisible: true, isLabelVisible: false } );

		render();
		await userEvent.click( screen.getByRole( 'button' ) );

		expect( closeAgentsManagerChat ).toHaveBeenCalledTimes( 1 );
		expect( openAgentsManagerChat ).not.toHaveBeenCalled();
		expect( recordAgentsManagerTracksEvent ).toHaveBeenCalledWith(
			'calypso_agents_manager_ai_chat_clicked',
			{ surface: 'masterbar', section: 'test-section', action: 'close' }
		);
	} );

	it( 'opens the chat when clicked while the chat is hidden', async () => {
		render();
		await userEvent.click( screen.getByRole( 'button' ) );

		expect( openAgentsManagerChat ).toHaveBeenCalledTimes( 1 );
		expect( closeAgentsManagerChat ).not.toHaveBeenCalled();
		expect( recordAgentsManagerTracksEvent ).toHaveBeenCalledWith(
			'calypso_agents_manager_ai_chat_clicked',
			{ surface: 'masterbar', section: 'test-section', action: 'open' }
		);
	} );

	it( 'records an unknown section when no section name is set', async () => {
		render( null );
		await userEvent.click( screen.getByRole( 'button' ) );

		expect( recordAgentsManagerTracksEvent ).toHaveBeenCalledWith(
			'calypso_agents_manager_ai_chat_clicked',
			{ surface: 'masterbar', section: 'unknown', action: 'open' }
		);
	} );
} );
