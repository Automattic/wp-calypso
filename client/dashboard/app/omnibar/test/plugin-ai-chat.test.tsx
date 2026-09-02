/**
 * @jest-environment jsdom
 */
import {
	closeAgentsManagerChat,
	isAgentsManagerChatVisible,
	openAgentsManagerChat,
	recordAgentsManagerTracksEvent,
} from '@automattic/agents-manager';
import { render, screen } from '@testing-library/react';
import { createAiChatNodeBuilder } from '../plugin-ai-chat';
import type { AdminBarNode, OmnibarNode } from '@automattic/omnibar';

jest.mock( '@automattic/agents-manager', () => ( {
	AiChatEntryLabel: () => <span aria-hidden="true">Agent</span>,
	closeAgentsManagerChat: jest.fn(),
	isAgentsManagerChatVisible: jest.fn( () => false ),
	openAgentsManagerChat: jest.fn(),
	recordAgentsManagerTracksEvent: jest.fn(),
} ) );

const mockIsChatVisible = isAgentsManagerChatVisible as jest.MockedFunction<
	typeof isAgentsManagerChatVisible
>;

const AI_CHAT_NODE: AdminBarNode = {
	id: 'agents-manager-ai-chat',
	title: '<span>Agent</span>',
	parent: 'top-secondary',
	href: '',
	group: false,
	meta: {
		menu_title: 'Agent',
		icon: 'sparkle',
	},
};

const buildAiChatNode = ( sectionName?: string ) =>
	createAiChatNodeBuilder( sectionName )( AI_CHAT_NODE );

describe( 'createAiChatNodeBuilder', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsChatVisible.mockReturnValue( false );
	} );

	it( 'takes its label, tooltip and icon from the admin bar node', () => {
		const node = buildAiChatNode( 'sites' );
		const { container } = render( node.icon as React.ReactElement );

		expect( node.label ).toBe( 'Agent' );
		expect( node.tooltip ).toBe( 'Agent' );
		expect( container.querySelector( '.omnibar__ai-chat-icon > svg' ) ).toBeVisible();
	} );

	it( 'renders the icon with the entry label beside it', () => {
		const node = buildAiChatNode( 'sites' );
		const { container } = render( <>{ node.render?.( node as OmnibarNode ) }</> );

		expect( container.querySelector( '.omnibar__ai-chat-icon > svg' ) ).toBeVisible();
		expect( screen.getByText( 'Agent' ) ).toBeVisible();
	} );

	it( 'drops the title so the button renders as an icon', () => {
		expect( buildAiChatNode( 'sites' ).title ).toBeUndefined();
	} );

	it( 'carries the class that marks it as the chat entry button', () => {
		expect( buildAiChatNode( 'sites' ).className ).toBe( 'masterbar__item-agents-manager-ai-chat' );
	} );

	it( 'records the masterbar event with the section and opens the chat on click', () => {
		buildAiChatNode( 'sites' ).onClick?.( {} as React.MouseEvent );

		expect( recordAgentsManagerTracksEvent ).toHaveBeenCalledWith(
			'calypso_agents_manager_ai_chat_clicked',
			{ surface: 'masterbar', section: 'sites', action: 'open' }
		);
		expect( openAgentsManagerChat ).toHaveBeenCalledTimes( 1 );
		expect( closeAgentsManagerChat ).not.toHaveBeenCalled();
	} );

	it( 'records an unknown section and closes a visible chat on click', () => {
		mockIsChatVisible.mockReturnValue( true );

		buildAiChatNode().onClick?.( {} as React.MouseEvent );

		expect( recordAgentsManagerTracksEvent ).toHaveBeenCalledWith(
			'calypso_agents_manager_ai_chat_clicked',
			{ surface: 'masterbar', section: 'unknown', action: 'close' }
		);
		expect( closeAgentsManagerChat ).toHaveBeenCalledTimes( 1 );
		expect( openAgentsManagerChat ).not.toHaveBeenCalled();
	} );
} );
