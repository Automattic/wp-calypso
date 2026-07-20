/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor, act } from '@testing-library/react';
import { useGetCombinedChat } from '../use-get-combined-chat';
import type { Message } from '../../types';

/**
 * Mutable state backing the mocked dependencies. Each test mutates these and
 * re-renders to drive the hook through the scenario under test.
 */
let mockIsChatLoaded = true;
let mockConnectionStatus: string | undefined;
let mockCurrentSupportInteraction: Record< string, unknown > | undefined;
let mockConversation: { id: string; messages: Message[] } | null;
const mockGetZendeskConversation = jest.fn();
const mockStartNewInteraction = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	// The hook's only useSelect call returns { isChatLoaded, connectionStatus }.
	useSelect: () => ( {
		isChatLoaded: mockIsChatLoaded,
		connectionStatus: mockConnectionStatus,
	} ),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	useIsMutating: () => 0,
} ) );

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '../use-logged-out-session', () => ( {
	useLoggedOutSession: () => ( {
		loggedOutOdieChatId: undefined,
		sessionId: undefined,
		botSlug: undefined,
	} ),
} ) );

jest.mock( '../../data', () => ( {
	useGetZendeskConversation: () => mockGetZendeskConversation,
	useManageSupportInteraction: () => ( { startNewInteraction: mockStartNewInteraction } ),
	useOdieChat: () => ( { data: undefined, isFetching: false } ),
} ) );

jest.mock( '../../data/use-current-support-interaction', () => ( {
	useCurrentSupportInteraction: () => ( {
		data: mockCurrentSupportInteraction,
		isLoading: false,
	} ),
} ) );

jest.mock( '../../utils', () => ( {
	getConversationIdFromInteraction: ( interaction: { conversationId?: string } ) =>
		interaction?.conversationId ?? null,
	getOdieIdFromInteraction: ( interaction: { odieId?: number } ) => interaction?.odieId ?? null,
	getIsRequestingHumanSupport: () => false,
} ) );

jest.mock( '../../constants', () => ( {
	HELP_CENTER_STORE: 'automattic/help-center',
	getOdieTransferMessages: () => [],
	getZendeskChatStartedMetaMessage: () => ( {
		content: 'chat-started',
		role: 'bot',
		type: 'message',
		metadata: { temporary_id: 'meta-started' },
	} ),
} ) );

jest.mock( '../../context', () => ( {
	emptyChat: {
		odieId: null,
		conversationId: null,
		messages: [],
		wpcomUserId: null,
		provider: 'odie',
		status: 'loading',
	},
} ) );

const agentMessage = ( id: number, content: string ): Message =>
	( {
		content,
		role: 'business',
		type: 'message',
		message_id: id,
		metadata: {},
	} ) as unknown as Message;

const renderCombinedChat = () =>
	renderHook( () => useGetCombinedChat( /* canConnectToZendesk */ true, /* isLoading */ false ) );

beforeEach( () => {
	jest.clearAllMocks();
	mockIsChatLoaded = true;
	mockConnectionStatus = undefined;
	mockCurrentSupportInteraction = undefined;
	mockConversation = null;
	mockGetZendeskConversation.mockImplementation( () => Promise.resolve( mockConversation ) );
} );

describe( 'useGetCombinedChat — message recovery on Smooch re-init', () => {
	it( 're-fetches the conversation and recovers gap messages when isChatLoaded flips false → true', async () => {
		mockCurrentSupportInteraction = {
			uuid: 'int-1',
			conversationId: 'conv-1',
			odieId: null,
			status: 'open',
		};
		mockConversation = { id: 'conv-1', messages: [ agentMessage( 1, 'before re-init' ) ] };

		const { result, rerender } = renderCombinedChat();

		// Initial load fetches the conversation through the normal path.
		await waitFor( () => {
			expect( mockGetZendeskConversation ).toHaveBeenCalledWith( 'conv-1' );
			expect( result.current.mainChatState.messages.some( ( m ) => m.message_id === 1 ) ).toBe(
				true
			);
		} );
		const callsAfterInitialLoad = mockGetZendeskConversation.mock.calls.length;

		// Smooch tears down: isChatLoaded → false. No fetch happens in this window.
		act( () => {
			mockIsChatLoaded = false;
		} );
		rerender();

		// A message arrives while the socket is down — it will only be present in
		// the next history fetch, never via the (removed) message:received listener.
		mockConversation = {
			id: 'conv-1',
			messages: [ agentMessage( 1, 'before re-init' ), agentMessage( 2, 'arrived during gap' ) ],
		};

		// Smooch finishes re-initializing: isChatLoaded → true.
		act( () => {
			mockIsChatLoaded = true;
		} );
		rerender();

		// The re-init forces a fresh conversation fetch that recovers the gap message.
		await waitFor( () => {
			expect( mockGetZendeskConversation.mock.calls.length ).toBeGreaterThan(
				callsAfterInitialLoad
			);
			expect( result.current.mainChatState.messages.some( ( m ) => m.message_id === 2 ) ).toBe(
				true
			);
		} );
	} );

	it( 'does not re-fetch on re-init when there is no active Zendesk conversation', async () => {
		mockCurrentSupportInteraction = {
			uuid: 'int-2',
			conversationId: undefined,
			odieId: 5,
		};

		const { rerender } = renderCombinedChat();

		// Let any initial effects settle.
		await act( async () => {
			await Promise.resolve();
		} );
		expect( mockGetZendeskConversation ).not.toHaveBeenCalled();

		// Full re-init cycle: true → false → true.
		act( () => {
			mockIsChatLoaded = false;
		} );
		rerender();
		act( () => {
			mockIsChatLoaded = true;
		} );
		rerender();

		await act( async () => {
			await Promise.resolve();
		} );

		// Pure-Odie chat: nothing to recover, so no conversation fetch is forced.
		expect( mockGetZendeskConversation ).not.toHaveBeenCalled();
	} );
} );
