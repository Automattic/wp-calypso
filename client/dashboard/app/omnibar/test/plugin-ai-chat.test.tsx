/**
 * @jest-environment jsdom
 */
import {
	closeAgentsManagerChat,
	isAgentsManagerChatVisible,
	openAgentsManagerChat,
	recordAgentsManagerTracksEvent,
} from '@automattic/agents-manager';
import { render, renderHook } from '@testing-library/react';
import { useAiChatPlugin } from '../plugin-ai-chat';
import type { AdminBarNode } from '@automattic/omnibar';

jest.mock( '@automattic/agents-manager', () => ( {
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
	title: '<span>Ask AI</span>',
	parent: 'top-secondary',
	href: '',
	group: false,
	meta: {
		menu_title: 'Ask AI',
		icon: 'ask-ai',
	},
};

const adminBarNodes = [ AI_CHAT_NODE ];

describe( 'useAiChatPlugin', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsChatVisible.mockReturnValue( false );
	} );

	it( 'returns no node when the admin bar has no AI chat node', () => {
		const { result } = renderHook( () =>
			useAiChatPlugin( { sectionName: 'sites', adminBarNodes: [] } )
		);

		expect( result.current ).toBeUndefined();
	} );

	it( 'takes its label, tooltip and icon from the admin bar node', () => {
		const { result } = renderHook( () =>
			useAiChatPlugin( { sectionName: 'sites', adminBarNodes } )
		);

		const { container } = render( result.current?.icon as React.ReactElement );

		expect( result.current?.label ).toBe( 'Ask AI' );
		expect( result.current?.tooltip ).toBe( 'Ask AI' );
		expect( container.querySelector( '.omnibar__ai-chat-icon > svg' ) ).toBeVisible();
	} );

	it( 'carries the class that marks it as the chat entry button', () => {
		const { result } = renderHook( () =>
			useAiChatPlugin( { sectionName: 'sites', adminBarNodes } )
		);

		expect( result.current?.className ).toBe( 'masterbar__item-agents-manager-ai-chat' );
	} );

	it( 'records the masterbar event with the section and opens the chat on click', () => {
		const { result } = renderHook( () =>
			useAiChatPlugin( { sectionName: 'sites', adminBarNodes } )
		);
		result.current?.onClick?.( {} as React.MouseEvent );

		expect( recordAgentsManagerTracksEvent ).toHaveBeenCalledWith(
			'calypso_agents_manager_ai_chat_clicked',
			{ surface: 'masterbar', section: 'sites', action: 'open' }
		);
		expect( openAgentsManagerChat ).toHaveBeenCalled();
		expect( closeAgentsManagerChat ).not.toHaveBeenCalled();
	} );

	it( 'records an unknown section and closes a visible chat on click', () => {
		mockIsChatVisible.mockReturnValue( true );

		const { result } = renderHook( () => useAiChatPlugin( { adminBarNodes } ) );
		result.current?.onClick?.( {} as React.MouseEvent );

		expect( recordAgentsManagerTracksEvent ).toHaveBeenCalledWith(
			'calypso_agents_manager_ai_chat_clicked',
			{ surface: 'masterbar', section: 'unknown', action: 'close' }
		);
		expect( closeAgentsManagerChat ).toHaveBeenCalled();
		expect( openAgentsManagerChat ).not.toHaveBeenCalled();
	} );
} );
