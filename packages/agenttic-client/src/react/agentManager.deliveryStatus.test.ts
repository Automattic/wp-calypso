/**
 * Integration tests for the WOOAI-872 fix path in `sendMessageStream`:
 * mark the user message as `pending` before the outbound stream fires, and
 * assign a temporary client-generated session id when none exists yet so
 * that `persistConversationHistory` actually writes the transcript to
 * sessionStorage (persistence is gated on `managedAgent.sessionId`).
 *
 * The observable claim these tests defend: even when the wire is aborted
 * before the server confirms the send, a subsequent page load sees the
 * user message in storage with `deliveryStatus: 'pending'`. That's the
 * signal `reconcileWithServer` reads to decide whether the message
 * completed on the server or should be surfaced as `failed`.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ClientConfig, Message, TaskUpdate } from '../client/types/index';

vi.mock( '../client/index', () => ( {
	createClient: vi.fn(),
	updateToolResultsWithResolvedPromises: vi.fn(),
	clearToolResultPromises: vi.fn(),
} ) );

vi.mock( '../client/utils/index', () => ( {
	createTextMessage: vi.fn(),
	extractToolCallsFromMessage: vi.fn(),
	generateMessageId: vi.fn( () => 'gen-id' ),
} ) );

vi.mock( './conversationStorage', async () => {
	const actual = await vi.importActual< object >( './conversationStorage' );
	return {
		...actual,
		clearConversation: vi.fn(),
		loadConversation: vi.fn(),
		storeConversation: vi.fn(),
	};
} );

import { type AgentManager, getAgentManager } from './agentManager';
import {
	clearToolResultPromises,
	createClient,
	updateToolResultsWithResolvedPromises,
} from '../client/index';
import {
	createTextMessage,
	extractToolCallsFromMessage,
} from '../client/utils/index';
import {
	loadConversation,
	storeConversation,
	clearConversation,
} from './conversationStorage';

interface StoreCall {
	sessionId: string;
	messages: Message[];
	storageKey?: string;
}

/**
 * Return the last call made to `storeConversation` in a compact,
 * assertion-friendly shape.
 */
function lastStoreCall(): StoreCall | null {
	const calls = vi.mocked( storeConversation ).mock.calls;
	if ( calls.length === 0 ) {
		return null;
	}
	const [ sessionId, messages, storageKey ] = calls[ calls.length - 1 ]!;
	return { sessionId, messages, storageKey };
}

/** Stream that never yields — models a mid-flight abort / navigation. */
function hangingStream() {
	return {
		[ Symbol.asyncIterator ]: () => ( {
			next: () =>
				new Promise< IteratorResult< TaskUpdate > >( () => undefined ),
		} ),
	};
}

/**
 * Drain until `predicate` is true. Fails the test on timeout.
 * @param predicate - Condition to wait for.
 */
async function waitFor( predicate: () => boolean ): Promise< void > {
	await vi.waitFor( () => {
		expect( predicate() ).toBe( true );
	} );
}

/** Drain until the pending user message has been persisted (pre-wire). */
async function flushPreLoopPersist(): Promise< void > {
	await waitFor( () => {
		const call = lastStoreCall();
		return (
			!! call &&
			call.messages.some(
				( m ) => m.metadata?.deliveryStatus === 'pending'
			)
		);
	} );
}

describe( 'agentManager.sendMessageStream — WOOAI-872 delivery-status fix', () => {
	let agentManager: AgentManager;
	let mockClient: any;

	const testConfig: ClientConfig = {
		agentId: 'test-agent',
		agentUrl: 'https://example.com/agent',
	};

	beforeEach( () => {
		vi.clearAllMocks();
		agentManager = getAgentManager();
		agentManager.clear();
		if ( typeof localStorage !== 'undefined' ) {
			localStorage.clear();
		}

		mockClient = {
			sendMessage: vi.fn(),
			sendMessageStream: vi.fn(),
		};

		vi.mocked( createClient ).mockReturnValue( mockClient );
		vi.mocked( createTextMessage ).mockImplementation(
			( text: string ) => ( {
				role: 'user' as const,
				kind: 'message' as const,
				parts: [ { type: 'text' as const, text } ],
				messageId: `msg-${ text }`,
				metadata: { timestamp: 0 },
			} )
		);
		vi.mocked( loadConversation ).mockResolvedValue( { messages: [] } );
		vi.mocked( storeConversation ).mockResolvedValue();
		vi.mocked( extractToolCallsFromMessage ).mockReturnValue( [] );
		vi.mocked( updateToolResultsWithResolvedPromises ).mockImplementation(
			( parts ) => parts
		);
		vi.mocked( clearToolResultPromises ).mockReturnValue();
	} );

	it( 'persists the user message with deliveryStatus=pending before the wire opens', async () => {
		mockClient.sendMessageStream.mockReturnValue( hangingStream() );

		await agentManager.createAgent( 'k', testConfig );

		const gen = agentManager.sendMessageStream( 'k', 'hello' );
		const iter = gen[ Symbol.asyncIterator ]();
		void iter.next();
		await flushPreLoopPersist();

		const call = lastStoreCall();
		expect( call ).not.toBeNull();
		expect( call!.messages.length ).toBeGreaterThan( 0 );

		const lastMessage = call!.messages[ call!.messages.length - 1 ]!;
		expect( lastMessage.role ).toBe( 'user' );
		expect( lastMessage.metadata?.deliveryStatus ).toBe( 'pending' );
	} );

	it( 'assigns a local- session id when none exists so persistence actually runs', async () => {
		mockClient.sendMessageStream.mockReturnValue( hangingStream() );

		await agentManager.createAgent( 'k', testConfig );

		const gen = agentManager.sendMessageStream( 'k', 'hello' );
		const iter = gen[ Symbol.asyncIterator ]();
		void iter.next();
		await flushPreLoopPersist();

		const call = lastStoreCall();
		expect( call ).not.toBeNull();
		expect( call!.sessionId ).toMatch( /^local-/ );
		expect( call!.storageKey ).toBeUndefined();
	} );

	it( 'does not publish the temp session id to consumers', async () => {
		mockClient.sendMessageStream.mockReturnValue( hangingStream() );
		const onSessionIdChange = vi.fn();
		const storageKey = 'wcai-session-cache';

		await agentManager.createAgent( 'k', {
			...testConfig,
			sessionIdStorageKey: storageKey,
			onSessionIdChange,
		} );

		const gen = agentManager.sendMessageStream( 'k', 'hello' );
		const iter = gen[ Symbol.asyncIterator ]();
		void iter.next();
		await flushPreLoopPersist();

		expect( onSessionIdChange ).not.toHaveBeenCalled();
		expect( localStorage.getItem( storageKey ) ).toBeNull();
		expect( lastStoreCall()!.sessionId ).toMatch( /^local-/ );
	} );

	it( 'does not overwrite an existing session id', async () => {
		mockClient.sendMessageStream.mockReturnValue( hangingStream() );

		await agentManager.createAgent( 'k', {
			...testConfig,
			sessionId: 'server-abc',
		} );

		const gen = agentManager.sendMessageStream( 'k', 'hello' );
		const iter = gen[ Symbol.asyncIterator ]();
		void iter.next();
		await flushPreLoopPersist();

		const call = lastStoreCall();
		expect( call ).not.toBeNull();
		expect( call!.sessionId ).toBe( 'server-abc' );
	} );

	it( 'assigns a temp id when conversationStorageKey is set but sessionId is not', async () => {
		mockClient.sendMessageStream.mockReturnValue( hangingStream() );

		await agentManager.createAgent( 'k', {
			...testConfig,
			conversationStorageKey: 'caller-owned',
		} );

		const gen = agentManager.sendMessageStream( 'k', 'hello' );
		const iter = gen[ Symbol.asyncIterator ]();
		void iter.next();
		await flushPreLoopPersist();

		const call = lastStoreCall();
		expect( call ).not.toBeNull();
		expect( call!.sessionId ).toMatch( /^local-/ );
		expect( call!.storageKey ).toBe( 'caller-owned' );
		const last = call!.messages[ call!.messages.length - 1 ]!;
		expect( last.metadata?.deliveryStatus ).toBe( 'pending' );
	} );

	it( 'does not mint a temp id when withHistory is false', async () => {
		mockClient.sendMessageStream.mockReturnValue( hangingStream() );
		const onSessionIdChange = vi.fn();

		await agentManager.createAgent( 'k', {
			...testConfig,
			onSessionIdChange,
		} );

		const gen = agentManager.sendMessageStream( 'k', 'hello', {
			withHistory: false,
		} );
		const iter = gen[ Symbol.asyncIterator ]();
		void iter.next();
		await waitFor(
			() =>
				vi.mocked( mockClient.sendMessageStream ).mock.calls.length > 0
		);

		expect( onSessionIdChange ).not.toHaveBeenCalled();
		expect( vi.mocked( storeConversation ).mock.calls ).toHaveLength( 0 );
		expect(
			agentManager
				.getConversationHistory( 'k' )
				.some( ( m ) => m.metadata?.deliveryStatus === 'pending' )
		).toBe( false );
	} );

	it( 'omits local-* session ids from the outbound stream request', async () => {
		mockClient.sendMessageStream.mockReturnValue( hangingStream() );

		await agentManager.createAgent( 'k', testConfig );

		const gen = agentManager.sendMessageStream( 'k', 'hello' );
		const iter = gen[ Symbol.asyncIterator ]();
		void iter.next();
		await waitFor(
			() =>
				vi.mocked( mockClient.sendMessageStream ).mock.calls.length > 0
		);

		expect( mockClient.sendMessageStream ).toHaveBeenCalledWith(
			expect.objectContaining( {
				sessionId: undefined,
			} )
		);
		// Local persist still used the temp id.
		expect( lastStoreCall()!.sessionId ).toMatch( /^local-/ );
	} );

	it( 'still sends a real server session id on the wire', async () => {
		mockClient.sendMessageStream.mockReturnValue( hangingStream() );

		await agentManager.createAgent( 'k', {
			...testConfig,
			sessionId: 'server-abc',
		} );

		const gen = agentManager.sendMessageStream( 'k', 'hello' );
		const iter = gen[ Symbol.asyncIterator ]();
		void iter.next();
		await waitFor(
			() =>
				vi.mocked( mockClient.sendMessageStream ).mock.calls.length > 0
		);

		expect( mockClient.sendMessageStream ).toHaveBeenCalledWith(
			expect.objectContaining( {
				sessionId: 'server-abc',
			} )
		);
	} );

	it( 'omits local-* session ids from non-stream sendMessage too', async () => {
		mockClient.sendMessageStream.mockReturnValue( hangingStream() );
		mockClient.sendMessage.mockResolvedValue( {
			id: 'task-1',
			sessionId: 'server-from-send',
			status: { state: 'completed' },
		} );

		await agentManager.createAgent( 'k', testConfig );

		// Mint local-* via the stream path, then use sendMessage while it is set.
		const gen = agentManager.sendMessageStream( 'k', 'hello' );
		const iter = gen[ Symbol.asyncIterator ]();
		void iter.next();
		await flushPreLoopPersist();
		expect( lastStoreCall()!.sessionId ).toMatch( /^local-/ );

		await agentManager.sendMessage( 'k', 'follow-up' );

		expect( mockClient.sendMessage ).toHaveBeenCalledWith(
			expect.objectContaining( {
				sessionId: undefined,
			} )
		);
	} );

	it( 're-keys storage from local-* to the server session id and clears the temp entry', async () => {
		const agentMessage: Message = {
			role: 'agent',
			kind: 'message',
			messageId: 'agent-1',
			parts: [ { type: 'text', text: 'hi back' } ],
		};
		mockClient.sendMessageStream.mockImplementation( async function* () {
			yield {
				id: 'task-1',
				sessionId: 'server-real',
				status: { state: 'working', message: agentMessage },
				final: false,
				text: 'hi',
			} as TaskUpdate;
			yield {
				id: 'task-1',
				sessionId: 'server-real',
				status: { state: 'completed', message: agentMessage },
				final: true,
				text: 'hi back',
			} as TaskUpdate;
		} );

		await agentManager.createAgent( 'k', testConfig );

		for await ( const _ of agentManager.sendMessageStream(
			'k',
			'hello'
		) ) {
			// drain
		}

		expect( clearConversation ).toHaveBeenCalledWith( 'local-gen-id' );
		const serverPersists = vi
			.mocked( storeConversation )
			.mock.calls.filter( ( [ sid ] ) => sid === 'server-real' );
		expect( serverPersists.length ).toBeGreaterThan( 0 );
	} );

	it( 'marks the user message complete when the stream finishes successfully', async () => {
		const agentMessage: Message = {
			role: 'agent',
			kind: 'message',
			messageId: 'agent-1',
			parts: [ { type: 'text', text: 'hi back' } ],
		};
		mockClient.sendMessageStream.mockImplementation( async function* () {
			yield {
				id: 'task-1',
				status: { state: 'completed', message: agentMessage },
				final: true,
				text: 'hi back',
			} as TaskUpdate;
		} );

		await agentManager.createAgent( 'k', {
			...testConfig,
			sessionId: 'server-abc',
		} );

		for await ( const _ of agentManager.sendMessageStream(
			'k',
			'hello'
		) ) {
			// drain
		}

		const call = lastStoreCall();
		expect( call ).not.toBeNull();
		const user = call!.messages.find( ( m ) => m.role === 'user' );
		expect( user?.metadata?.deliveryStatus ).toBe( 'complete' );
	} );

	it( 'does not clear an older pending orphan when a later turn completes', async () => {
		const orphan: Message = {
			role: 'user',
			kind: 'message',
			messageId: 'orphan-1',
			parts: [ { type: 'text', text: 'aborted earlier' } ],
			metadata: { timestamp: 1, deliveryStatus: 'pending' },
		};
		vi.mocked( loadConversation ).mockResolvedValue( {
			messages: [ orphan ],
		} );

		const agentMessage: Message = {
			role: 'agent',
			kind: 'message',
			messageId: 'agent-1',
			parts: [ { type: 'text', text: 'hi back' } ],
		};
		mockClient.sendMessageStream.mockImplementation( async function* () {
			yield {
				id: 'task-1',
				status: { state: 'completed', message: agentMessage },
				final: true,
				text: 'hi back',
			} as TaskUpdate;
		} );

		await agentManager.createAgent( 'k', {
			...testConfig,
			sessionId: 'server-abc',
		} );

		for await ( const _ of agentManager.sendMessageStream(
			'k',
			'hello'
		) ) {
			// drain
		}

		const call = lastStoreCall();
		expect( call ).not.toBeNull();
		const orphaned = call!.messages.find(
			( m ) => m.messageId === 'orphan-1'
		);
		const completed = call!.messages.find(
			( m ) => m.messageId === 'msg-hello'
		);
		expect( orphaned?.metadata?.deliveryStatus ).toBe( 'pending' );
		expect( completed?.metadata?.deliveryStatus ).toBe( 'complete' );
	} );

	it( 'leaves deliveryStatus pending when the stream is aborted before final', async () => {
		mockClient.sendMessageStream.mockReturnValue( hangingStream() );

		await agentManager.createAgent( 'k', {
			...testConfig,
			sessionId: 'server-abc',
		} );

		const gen = agentManager.sendMessageStream( 'k', 'hello' );
		const iter = gen[ Symbol.asyncIterator ]();
		void iter.next();
		await waitFor( () => {
			const call = lastStoreCall();
			return (
				!! call &&
				call.messages.some(
					( m ) => m.metadata?.deliveryStatus === 'pending'
				)
			);
		} );

		agentManager.abortCurrentRequest( 'k' );

		const call = lastStoreCall();
		expect( call ).not.toBeNull();
		const pending = call!.messages.find(
			( m ) => m.metadata?.deliveryStatus === 'pending'
		);
		expect( pending ).toBeDefined();
	} );

	it( 'marks the in-flight user turn failed when the stream finals as failed', async () => {
		mockClient.sendMessageStream.mockImplementation( async function* () {
			yield {
				id: 'task-1',
				status: { state: 'failed' },
				final: true,
			} as TaskUpdate;
		} );

		await agentManager.createAgent( 'k', {
			...testConfig,
			sessionId: 'server-abc',
		} );

		for await ( const _ of agentManager.sendMessageStream(
			'k',
			'hello'
		) ) {
			// drain
		}

		const user = lastStoreCall()?.messages.find(
			( m ) => m.role === 'user'
		);
		expect( user?.metadata?.deliveryStatus ).toBe( 'failed' );
	} );

	it( 'completes the opener after a tool-result-only follow-up stream succeeds', async () => {
		mockClient.sendMessageStream
			.mockImplementationOnce( async function* () {
				yield {
					id: 'task-1',
					status: {
						state: 'input-required',
						message: {
							role: 'agent',
							kind: 'message',
							messageId: 'agent-tool',
							parts: [
								{
									type: 'data',
									data: {
										toolCallId: 'tc1',
										toolId: 't',
										arguments: {},
									},
								},
							],
						},
					},
					final: true,
				} as TaskUpdate;
			} )
			.mockImplementationOnce( async function* () {
				yield {
					id: 'task-2',
					status: {
						state: 'completed',
						message: {
							role: 'agent',
							kind: 'message',
							messageId: 'agent-done',
							parts: [ { type: 'text', text: 'done' } ],
						},
					},
					final: true,
					text: 'done',
				} as TaskUpdate;
			} );

		await agentManager.createAgent( 'k', {
			...testConfig,
			sessionId: 'server-abc',
		} );

		for await ( const _ of agentManager.sendMessageStream(
			'k',
			'hello'
		) ) {
			// drain opener → input-required
		}

		expect(
			lastStoreCall()?.messages.find(
				( m ) => m.messageId === 'msg-hello'
			)?.metadata?.deliveryStatus
		).toBe( 'pending' );

		for await ( const _ of agentManager.sendMessageStream( 'k', '', {
			message: {
				role: 'user',
				kind: 'message',
				messageId: 'tool-result-1',
				parts: [
					{
						type: 'data',
						data: {
							toolCallId: 'tc1',
							toolId: 't',
							result: 'ok',
						},
					},
				],
			},
		} ) ) {
			// drain tool follow-up
		}

		const call = lastStoreCall();
		expect(
			call?.messages.find( ( m ) => m.messageId === 'msg-hello' )
				?.metadata?.deliveryStatus
		).toBe( 'complete' );
		expect(
			call?.messages.find( ( m ) => m.messageId === 'tool-result-1' )
				?.metadata?.deliveryStatus
		).toBeUndefined();
	} );
} );
