/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
const mockResumeChat = jest.fn();

jest.mock( '../../stores', () => ( { AGENTS_MANAGER_STORE: 'automattic/agents-manager' } ) );
jest.mock( '@wordpress/data', () => ( { useSelect: jest.fn( () => false ) } ) );
jest.mock( 'react-router-dom', () => ( {
	useLocation: () => ( { pathname: '/chat' } ),
	useNavigate: () => jest.fn(),
} ) );
jest.mock( '../../contexts', () => ( {
	useAgentsManagerContext: () => ( { resumeChat: mockResumeChat, sectionName: 'wp-admin' } ),
} ) );
jest.mock( '../../utils/tracks', () => ( { recordAgentsManagerTracksEvent: jest.fn() } ) );
jest.mock( '@automattic/calypso-analytics', () => ( {
	getValidBlogId: () => null,
	recordTracksEvent: jest.fn(),
	withSiteContext: ( props: object ) => props,
} ) );
jest.mock( '../use-ai-chat-entry-state', () => ( { useAiChatEntryState: jest.fn() } ) );
jest.mock( '../use-has-ai-chat-entry-button', () => ( {
	__esModule: true,
	default: () => true,
	ADMIN_BAR_AI_CHAT_BUTTON_ID: 'wp-admin-bar-agents-manager-ai-chat',
} ) );

import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordAgentsManagerTracksEvent } from '../../utils/tracks';
import useAdminBarIntegration from '../use-admin-bar-integration';
import { useAiChatEntryState } from '../use-ai-chat-entry-state';

const mockUseAiChatEntryState = useAiChatEntryState as jest.Mock;

const openChat = jest.fn();
const closeChat = jest.fn();

// The PHP-rendered AI chat button: the row holds the icon and the label.
const aiChatButton = document.createElement( 'li' );
aiChatButton.id = 'wp-admin-bar-agents-manager-ai-chat';
aiChatButton.innerHTML =
	'<div class="ab-item"><span class="agents-manager-ai-chat-label"><span>Agent</span></span></div>';
const label = aiChatButton.querySelector( '.agents-manager-ai-chat-label' )!;

const renderWithChatVisible = ( isChatVisible: boolean ) => {
	mockUseAiChatEntryState.mockReturnValue( { hasLoaded: true, isChatVisible } );
	return renderHook( () => useAdminBarIntegration( { openChat, closeChat } ) );
};

describe( 'useAdminBarIntegration', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		aiChatButton.className = '';
		label.className = 'agents-manager-ai-chat-label';
		document.body.append( aiChatButton );
	} );

	afterEach( () => aiChatButton.remove() );

	it( 'leaves a page-painted label alone while the chat stays hidden', () => {
		renderWithChatVisible( false );

		expect( aiChatButton ).not.toHaveClass( 'is-chat-visible' );
		expect( label ).not.toHaveClass( 'is-revealed' );
	} );

	it( 'marks the node while the chat is visible', () => {
		renderWithChatVisible( true );

		expect( aiChatButton ).toHaveClass( 'is-chat-visible' );
	} );

	it( 'reveals the label when the chat closes', () => {
		const { rerender } = renderWithChatVisible( true );

		mockUseAiChatEntryState.mockReturnValue( { hasLoaded: true, isChatVisible: false } );
		rerender();

		expect( aiChatButton ).not.toHaveClass( 'is-chat-visible' );
		expect( label ).toHaveClass( 'is-revealed' );
	} );

	it( 'reveals the label when PHP pre-hid it but the store says the chat is hidden', () => {
		aiChatButton.className = 'is-chat-visible';

		renderWithChatVisible( false );

		expect( aiChatButton ).not.toHaveClass( 'is-chat-visible' );
		expect( label ).toHaveClass( 'is-revealed' );
	} );

	it( 'closes the chat when the button is clicked while the chat is visible', async () => {
		renderWithChatVisible( true );

		await userEvent.click( aiChatButton );

		expect( closeChat ).toHaveBeenCalledTimes( 1 );
		expect( openChat ).not.toHaveBeenCalled();
		expect( recordAgentsManagerTracksEvent ).toHaveBeenCalledWith(
			'calypso_agents_manager_ai_chat_clicked',
			{ surface: 'admin_bar', section: 'wp-admin', action: 'close' }
		);
	} );

	it( 'resumes and opens the chat when the button is clicked while the chat is hidden', async () => {
		renderWithChatVisible( false );

		await userEvent.click( aiChatButton );

		expect( mockResumeChat ).toHaveBeenCalledTimes( 1 );
		expect( openChat ).toHaveBeenCalledTimes( 1 );
		expect( closeChat ).not.toHaveBeenCalled();
	} );

	it( 'does nothing without the admin bar button', () => {
		aiChatButton.remove();

		expect( () => renderWithChatVisible( false ) ).not.toThrow();
	} );
} );
