/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useRefreshChatOnFocus } from '../use-refresh-chat-on-focus';
import type { Chat } from '../../types';

/**
 * Mutable state backing the mocked dependencies. Each test mutates these to
 * drive the hook through the scenario under test.
 */
let mockChatStatus: Chat[ 'status' ] = 'loaded';
let mockInteraction: { uuid: string } | undefined = { uuid: 'int-1' };
let mockLoggedOutOdieChatId: number | null = null;
const mockSetChat = jest.fn();
const mockInvalidateQueries = jest.fn< Promise< void >, [ { queryKey: unknown[] } ] >( () =>
	Promise.resolve()
);

jest.mock( '../../context', () => ( {
	useOdieAssistantContext: () => ( { chat: { status: mockChatStatus }, setChat: mockSetChat } ),
} ) );

jest.mock( '../../data/use-current-support-interaction', () => ( {
	useCurrentSupportInteraction: () => ( { data: mockInteraction } ),
} ) );

jest.mock( '../use-logged-out-session', () => ( {
	useLoggedOutSession: () => ( { loggedOutOdieChatId: mockLoggedOutOdieChatId } ),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	useQueryClient: () => ( { invalidateQueries: mockInvalidateQueries } ),
} ) );

jest.mock( '@automattic/zendesk-client', () => ( {
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

// The updater the hook handed to setChat, applied to a chat in `status`.
const applyLastUpdater = ( status: Chat[ 'status' ] ) => {
	const updater = mockSetChat.mock.calls.at( -1 )?.[ 0 ];
	const chat = { status, messages: [] } as unknown as Chat;
	return updater( chat );
};

beforeEach( () => {
	jest.clearAllMocks();
	mockChatStatus = 'loaded';
	mockInteraction = { uuid: 'int-1' };
	mockLoggedOutOdieChatId = null;
} );

describe( 'useRefreshChatOnFocus', () => {
	it( 'refetches the interaction first, then the Odie chat, then shows the loader', async () => {
		renderHook( () => useRefreshChatOnFocus() );

		await comeBackToTab();

		expect( mockInvalidateQueries.mock.calls.map( ( [ arg ] ) => arg ) ).toEqual( [
			interactionKey,
			odieChatKey,
		] );
		expect( applyLastUpdater( 'loaded' ) ).toMatchObject( { status: 'loading' } );
	} );

	it( 'also refreshes when the window gains focus', async () => {
		renderHook( () => useRefreshChatOnFocus() );

		await act( async () => {
			window.dispatchEvent( new Event( 'focus' ) );
			await Promise.resolve();
			await Promise.resolve();
		} );

		expect( mockInvalidateQueries ).toHaveBeenCalledWith( interactionKey );
		expect( mockSetChat ).toHaveBeenCalled();
	} );

	it( 'does not interrupt a send in progress', async () => {
		mockChatStatus = 'sending';
		renderHook( () => useRefreshChatOnFocus() );

		await comeBackToTab();

		expect( mockInvalidateQueries ).not.toHaveBeenCalled();
		expect( mockSetChat ).not.toHaveBeenCalled();
	} );

	it( 'leaves the chat alone if a send started while the interaction was refetched', async () => {
		renderHook( () => useRefreshChatOnFocus() );

		await comeBackToTab();

		const sendingChat = { status: 'sending', messages: [] } as unknown as Chat;
		expect( mockSetChat.mock.calls.at( -1 )?.[ 0 ]( sendingChat ) ).toBe( sendingChat );
	} );

	it( 'does nothing for a chat that has not been created yet', async () => {
		mockInteraction = undefined;
		renderHook( () => useRefreshChatOnFocus() );

		await comeBackToTab();

		expect( mockInvalidateQueries ).not.toHaveBeenCalled();
		expect( mockSetChat ).not.toHaveBeenCalled();
	} );

	it( 'refreshes a logged-out chat, which has no interaction to refetch', async () => {
		mockInteraction = undefined;
		mockLoggedOutOdieChatId = 42;
		renderHook( () => useRefreshChatOnFocus() );

		await comeBackToTab();

		expect( mockInvalidateQueries.mock.calls.map( ( [ arg ] ) => arg ) ).toEqual( [ odieChatKey ] );
		expect( applyLastUpdater( 'loaded' ) ).toMatchObject( { status: 'loading' } );
	} );

	it( 'runs at most once every few seconds', async () => {
		renderHook( () => useRefreshChatOnFocus() );

		await comeBackToTab();
		await comeBackToTab();

		expect( mockSetChat ).toHaveBeenCalledTimes( 1 );
	} );
} );
