/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { ODIE_CALL_AN_HE_BOT_SLUG, ODIE_NEW_INTERACTIONS_BOT_SLUG } from '../../constants';
import { usePollForDelayedReplies } from '../use-poll-for-delayed-replies';
import type { Chat, Message, OdieChat } from '../../types';

const POLL_INTERVAL_MS = 5000;
const QUIET_PERIOD_MS = 20 * 60 * 1000;

/**
 * Mutable state backing the mocked dependencies. Each test mutates these to
 * drive the hook through the scenario under test.
 */
let mockChat: Chat;
let mockIsMinimized = false;
let mockBotSlug: string = ODIE_CALL_AN_HE_BOT_SLUG;
const mockSetChat = jest.fn();
const mockFetchOdieChat = jest.fn< Promise< OdieChat >, [ unknown ] >();

// `constants` imports these; the mocks keep their build output out of the test.
jest.mock( '@automattic/zendesk-client', () => ( {
	isTestModeEnvironment: () => false,
} ) );

jest.mock( '@automattic/data-stores', () => ( {
	HelpCenter: { PLANS_PRESALES_LAUNCHER_CONTEXT: 'plans-presales' },
} ) );

jest.mock( '../../context', () => ( {
	useOdieAssistantContext: () => ( {
		chat: mockChat,
		setChat: mockSetChat,
		isMinimized: mockIsMinimized,
		version: null,
	} ),
} ) );

jest.mock( '../../data/use-current-support-interaction', () => ( {
	useCurrentSupportInteraction: () => ( { data: { bot_slug: mockBotSlug } } ),
} ) );

jest.mock( '../../data/use-odie-chat', () => ( {
	fetchOdieChat: ( ...args: [ unknown ] ) => mockFetchOdieChat( ...args ),
} ) );

const userMessage = { role: 'user', type: 'message', content: 'Hi', message_id: 1 } as Message;
const botMessage = { role: 'bot', type: 'message', content: 'Hello', message_id: 2 } as Message;
const delayedReply = {
	role: 'bot',
	type: 'message',
	content: 'A colleague says…',
	message_id: 3,
} as Message;

const makeChat = ( overrides: Partial< Chat > = {} ): Chat => ( {
	provider: 'odie',
	status: 'loaded',
	odieId: 123,
	conversationId: null,
	messages: [ userMessage, botMessage ],
	...overrides,
} );

const serverChat = ( messages: Message[] ): OdieChat => ( { odieId: 123, messages } );

const setVisibility = ( state: DocumentVisibilityState ) =>
	Object.defineProperty( document, 'visibilityState', { configurable: true, get: () => state } );

// One poll tick, with the fetch and the state update that follow it settled.
const tick = ( ms = POLL_INTERVAL_MS ) =>
	act( async () => {
		await jest.advanceTimersByTimeAsync( ms );
	} );

// The updater the hook handed to setChat, applied to `prev`.
const applyLastUpdater = ( prev: Chat ): Chat => mockSetChat.mock.calls.at( -1 )?.[ 0 ]( prev );

beforeEach( () => {
	jest.useFakeTimers();
	jest.clearAllMocks();
	mockChat = makeChat();
	mockIsMinimized = false;
	mockBotSlug = ODIE_CALL_AN_HE_BOT_SLUG;
	mockFetchOdieChat.mockResolvedValue( serverChat( [ userMessage, botMessage ] ) );
	setVisibility( 'visible' );
} );

afterEach( () => {
	jest.useRealTimers();
} );

describe( 'usePollForDelayedReplies', () => {
	it( 'fetches the chat every 5 seconds', async () => {
		renderHook( () => usePollForDelayedReplies() );

		await tick();
		await tick();

		expect( mockFetchOdieChat ).toHaveBeenCalledTimes( 2 );
		expect( mockFetchOdieChat ).toHaveBeenCalledWith( {
			botSlug: ODIE_CALL_AN_HE_BOT_SLUG,
			chatId: 123,
			version: null,
		} );
	} );

	it( 'appends a new bot message and leaves the status alone', async () => {
		mockFetchOdieChat.mockResolvedValue( serverChat( [ userMessage, botMessage, delayedReply ] ) );
		renderHook( () => usePollForDelayedReplies() );

		await tick();

		const next = applyLastUpdater( makeChat() );
		expect( next.messages ).toEqual( [ userMessage, botMessage, delayedReply ] );
		expect( next.status ).toBe( 'loaded' );
	} );

	it( 'adds the same message only once across ticks', async () => {
		mockFetchOdieChat.mockResolvedValue( serverChat( [ userMessage, botMessage, delayedReply ] ) );
		renderHook( () => usePollForDelayedReplies() );

		await tick();
		const afterFirst = applyLastUpdater( makeChat() );
		await tick();
		const afterSecond = applyLastUpdater( afterFirst );

		expect( afterSecond ).toBe( afterFirst );
	} );

	it( 'slots in a reply that arrived just before the customer wrote again', async () => {
		// The customer's own message is added in the browser, without an id; the bot's answer to
		// it comes back from the send with its id, so it is already on screen when the poll resumes.
		const laterUserMessage = { role: 'user', type: 'message', content: 'Anything?' } as Message;
		const laterBotMessage = { ...botMessage, message_id: 5, content: 'Not yet.' };
		mockFetchOdieChat.mockResolvedValue(
			serverChat( [
				userMessage,
				botMessage,
				delayedReply,
				{ ...laterUserMessage, message_id: 4 },
				laterBotMessage,
			] )
		);
		renderHook( () => usePollForDelayedReplies() );

		await tick();

		const prev = makeChat( {
			messages: [ userMessage, botMessage, laterUserMessage, laterBotMessage ],
		} );
		expect( applyLastUpdater( prev ).messages ).toEqual( [
			userMessage,
			botMessage,
			delayedReply,
			laterUserMessage,
			laterBotMessage,
		] );
	} );

	it( 'drops the result if a send is running when it arrives', async () => {
		mockFetchOdieChat.mockResolvedValue( serverChat( [ userMessage, botMessage, delayedReply ] ) );
		renderHook( () => usePollForDelayedReplies() );

		await tick();

		const sending = makeChat( { status: 'sending' } );
		expect( applyLastUpdater( sending ) ).toBe( sending );
	} );

	it( 'returns the same chat when the server has nothing new', async () => {
		renderHook( () => usePollForDelayedReplies() );

		await tick();

		const prev = makeChat();
		expect( applyLastUpdater( prev ) ).toBe( prev );
	} );

	it( 'ignores new user messages', async () => {
		const laterUserMessage = { ...userMessage, message_id: 3, content: 'Still there?' };
		mockFetchOdieChat.mockResolvedValue(
			serverChat( [ userMessage, botMessage, laterUserMessage ] )
		);
		renderHook( () => usePollForDelayedReplies() );

		await tick();

		const prev = makeChat();
		expect( applyLastUpdater( prev ) ).toBe( prev );
	} );

	it( 'does not poll chats on the normal bot', async () => {
		mockBotSlug = ODIE_NEW_INTERACTIONS_BOT_SLUG;
		renderHook( () => usePollForDelayedReplies() );

		await tick();

		expect( mockFetchOdieChat ).not.toHaveBeenCalled();
	} );

	it( 'does not poll a human chat', async () => {
		mockChat = makeChat( { provider: 'zendesk' } );
		renderHook( () => usePollForDelayedReplies() );

		await tick();

		expect( mockFetchOdieChat ).not.toHaveBeenCalled();
	} );

	it( 'does not poll while the Help Center is minimized', async () => {
		mockIsMinimized = true;
		renderHook( () => usePollForDelayedReplies() );

		await tick();

		expect( mockFetchOdieChat ).not.toHaveBeenCalled();
	} );

	it( 'skips the tick while the tab is hidden', async () => {
		renderHook( () => usePollForDelayedReplies() );

		setVisibility( 'hidden' );
		await tick();
		expect( mockFetchOdieChat ).not.toHaveBeenCalled();

		setVisibility( 'visible' );
		await tick();
		expect( mockFetchOdieChat ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'stops after 20 quiet minutes and starts again with the next message', async () => {
		const { rerender } = renderHook( () => usePollForDelayedReplies() );

		await tick( QUIET_PERIOD_MS + POLL_INTERVAL_MS );
		const callsBefore = mockFetchOdieChat.mock.calls.length;
		await tick();
		expect( mockFetchOdieChat ).toHaveBeenCalledTimes( callsBefore );

		mockChat = makeChat( { messages: [ userMessage, botMessage, delayedReply ] } );
		rerender();
		await tick();
		expect( mockFetchOdieChat ).toHaveBeenCalledTimes( callsBefore + 1 );
	} );

	it( 'ignores a failed request and tries again on the next tick', async () => {
		mockFetchOdieChat.mockRejectedValueOnce( new Error( 'offline' ) );
		renderHook( () => usePollForDelayedReplies() );

		await tick();
		expect( mockSetChat ).not.toHaveBeenCalled();

		await tick();
		expect( mockFetchOdieChat ).toHaveBeenCalledTimes( 2 );
		expect( mockSetChat ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'stops polling on unmount', async () => {
		const { unmount } = renderHook( () => usePollForDelayedReplies() );

		await tick();
		unmount();
		await tick();

		expect( mockFetchOdieChat ).toHaveBeenCalledTimes( 1 );
	} );
} );
