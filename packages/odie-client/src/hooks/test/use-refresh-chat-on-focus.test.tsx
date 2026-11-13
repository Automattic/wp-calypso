import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useRefreshChatOnFocus } from '../use-refresh-chat-on-focus';
import type { Chat } from '../../types';

/**
 * Mutable state backing the mocked dependencies. Each test mutates these to
 * drive the hook through the scenario under test.
 */
let mockChatStatus: Chat[ 'status' ] = 'loaded';
let mockChatConversationId: string | null = null;
let mockInteraction: { uuid: string } | undefined = { uuid: 'int-1' };
// The interaction as the refetch returns it.
let mockFreshInteraction: { uuid: string; events: Record< string, string >[] } | undefined;
// The cached interaction: the refetched one only once the interaction's invalidation resolves.
let mockCachedInteraction: typeof mockFreshInteraction;
let mockLoggedOutOdieChatId: number | null = null;
const mockSetChat = vi.fn();
const mockRefreshChatInBackground = vi.fn();
const mockInvalidateQueries = vi.fn< ( ...args: [ { queryKey: unknown[] } ] ) => Promise< void > >(
	( { queryKey } ) =>
		Promise.resolve().then( () => {
			if ( queryKey[ 0 ] === 'support-interactions' ) {
				mockCachedInteraction = mockFreshInteraction;
			}
		} )
);

vi.mock( '../../context', () => ( {
	useOdieAssistantContext: () => ( {
		chat: { status: mockChatStatus, conversationId: mockChatConversationId },
		setChat: mockSetChat,
		refreshChatInBackground: mockRefreshChatInBackground,
	} ),
} ) );

vi.mock( '../../data/use-current-support-interaction', () => ( {
	useCurrentSupportInteraction: () => ( { data: mockInteraction } ),
} ) );

vi.mock( '../use-logged-out-session', () => ( {
	useLoggedOutSession: () => ( { loggedOutOdieChatId: mockLoggedOutOdieChatId } ),
} ) );

vi.mock( '@tanstack/react-query', () => ( {
	useQueryClient: () => ( {
		invalidateQueries: mockInvalidateQueries,
		getQueryData: () => mockCachedInteraction,
	} ),
} ) );

vi.mock( '@automattic/zendesk-client', () => ( {
	isTestModeEnvironment: () => false,
} ) );

const interactionKey = {
	queryKey: [ 'support-interactions', 'get-interaction-by-id', 'int-1', false ],
};
const odieChatKey = { queryKey: [ 'odie-chat' ] };

// The refresh awaits the interaction refetch before it touches the chat.
const comeBackToTab = () =>
	act( async () => {
		Object.defineProperty( document, 'visibilityState', {
			configurable: true,
			get: () => 'visible',
		} );
		document.dispatchEvent( new Event( 'visibilitychange' ) );
		await Promise.resolve();
		await Promise.resolve();
	} );

// The updater the hook handed to setChat, applied to `chat`.
const applyLastUpdater = ( chat: Partial< Chat > ) => {
	const updater = mockSetChat.mock.calls.at( -1 )?.[ 0 ];
	return updater( { messages: [], conversationId: null, ...chat } as unknown as Chat );
};

const movedToHuman = {
	uuid: 'int-1',
	events: [
		{ event_source: 'odie', event_external_id: '42' },
		{ event_source: 'zendesk', event_external_id: 'conv-1' },
	],
};

beforeEach( () => {
	vi.clearAllMocks();
	mockChatStatus = 'loaded';
	mockChatConversationId = null;
	mockInteraction = { uuid: 'int-1' };
	mockFreshInteraction = {
		uuid: 'int-1',
		events: [ { event_source: 'odie', event_external_id: '42' } ],
	};
	mockCachedInteraction = mockFreshInteraction;
	mockLoggedOutOdieChatId = null;
} );

describe( 'useRefreshChatOnFocus', () => {
	it( 'refetches the interaction first, then the Odie chat, then refreshes the chat in the background', async () => {
		renderHook( () => useRefreshChatOnFocus() );

		await comeBackToTab();

		expect( mockInvalidateQueries.mock.calls.map( ( [ arg ] ) => arg ) ).toEqual( [
			interactionKey,
			odieChatKey,
		] );
		expect( mockRefreshChatInBackground ).toHaveBeenCalledTimes( 1 );
		expect( mockRefreshChatInBackground.mock.invocationCallOrder[ 0 ] ).toBeGreaterThan(
			mockInvalidateQueries.mock.invocationCallOrder[ 1 ]
		);
		expect( mockSetChat ).not.toHaveBeenCalled();
	} );

	it( 'also refreshes when the window gains focus', async () => {
		renderHook( () => useRefreshChatOnFocus() );

		await act( async () => {
			window.dispatchEvent( new Event( 'focus' ) );
			await Promise.resolve();
			await Promise.resolve();
		} );

		expect( mockInvalidateQueries ).toHaveBeenCalledWith( interactionKey );
		expect( mockRefreshChatInBackground ).toHaveBeenCalled();
	} );

	it( 'does not interrupt a send in progress', async () => {
		mockChatStatus = 'sending';
		renderHook( () => useRefreshChatOnFocus() );

		await comeBackToTab();

		expect( mockInvalidateQueries ).not.toHaveBeenCalled();
		expect( mockRefreshChatInBackground ).not.toHaveBeenCalled();
		expect( mockSetChat ).not.toHaveBeenCalled();
	} );

	it( 'does nothing for a chat that has not been created yet', async () => {
		mockInteraction = undefined;
		renderHook( () => useRefreshChatOnFocus() );

		await comeBackToTab();

		expect( mockInvalidateQueries ).not.toHaveBeenCalled();
		expect( mockRefreshChatInBackground ).not.toHaveBeenCalled();
	} );

	it( 'refreshes a logged-out chat, which has no interaction to refetch', async () => {
		mockInteraction = undefined;
		mockLoggedOutOdieChatId = 42;
		renderHook( () => useRefreshChatOnFocus() );

		await comeBackToTab();

		expect( mockInvalidateQueries.mock.calls.map( ( [ arg ] ) => arg ) ).toEqual( [ odieChatKey ] );
		expect( mockRefreshChatInBackground ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'loads the chat with the loader when another tab moved it to a human', async () => {
		mockFreshInteraction = movedToHuman;
		renderHook( () => useRefreshChatOnFocus() );

		await comeBackToTab();

		expect( mockInvalidateQueries.mock.calls.map( ( [ arg ] ) => arg ) ).toEqual( [
			interactionKey,
			odieChatKey,
		] );
		expect( mockRefreshChatInBackground ).not.toHaveBeenCalled();
		expect( applyLastUpdater( { status: 'loaded' } ) ).toMatchObject( { status: 'loading' } );
		// Re-checked when it applies: a send may have started, or the chat moved, meanwhile.
		const sendingChat = { status: 'sending', messages: [] } as unknown as Chat;
		expect( mockSetChat.mock.calls.at( -1 )?.[ 0 ]( sendingChat ) ).toBe( sendingChat );
		expect( applyLastUpdater( { status: 'loaded', conversationId: 'conv-1' } ) ).toMatchObject( {
			status: 'loaded',
		} );
	} );

	it( 'refreshes a human chat in the background', async () => {
		mockChatConversationId = 'conv-1';
		mockFreshInteraction = movedToHuman;
		renderHook( () => useRefreshChatOnFocus() );

		await comeBackToTab();

		expect( mockRefreshChatInBackground ).toHaveBeenCalledTimes( 1 );
		expect( mockSetChat ).not.toHaveBeenCalled();
	} );

	it( 'runs at most once every few seconds', async () => {
		renderHook( () => useRefreshChatOnFocus() );

		await comeBackToTab();
		await comeBackToTab();

		expect( mockRefreshChatInBackground ).toHaveBeenCalledTimes( 1 );
	} );
} );
