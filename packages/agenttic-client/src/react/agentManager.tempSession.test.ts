/**
 * Integration tests for the temporary session id in `sendMessageStream`: when
 * none exists yet, a client-generated `local-*` id is assigned so that
 * `persistConversationHistory` writes the transcript to sessionStorage
 * (persistence is gated on `managedAgent.sessionId`), and it is swapped for the
 * server's id once the server sends one.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	clearToolResultPromises,
	createClient,
	updateToolResultsWithResolvedPromises,
} from '../client/index';
import { createTextMessage, extractToolCallsFromMessage } from '../client/utils/index';
import { type AgentManager, getAgentManager } from './agentManager';
import { loadConversation, storeConversation, clearConversation } from './conversationStorage';
import type { ClientConfig, Message, TaskUpdate } from '../client/types/index';

async function drain( stream: AsyncIterable< unknown > ): Promise< void > {
	const iterator = stream[ Symbol.asyncIterator ]();
	while ( ! ( await iterator.next() ).done ) {
		// consume
	}
}

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
			next: () => new Promise< IteratorResult< TaskUpdate > >( () => undefined ),
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

/** Drain until the user message has been persisted (pre-wire). */
async function flushPreLoopPersist(): Promise< void > {
	await waitFor( () => {
		const call = lastStoreCall();
		return !! call && call.messages.some( ( m ) => m.role === 'user' );
	} );
}

describe( 'agentManager.sendMessageStream: temporary session id', () => {
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
		vi.mocked( createTextMessage ).mockImplementation( ( text: string ) => ( {
			role: 'user' as const,
			kind: 'message' as const,
			parts: [ { type: 'text' as const, text } ],
			messageId: `msg-${ text }`,
			metadata: { timestamp: 0 },
		} ) );
		vi.mocked( loadConversation ).mockResolvedValue( { messages: [] } );
		vi.mocked( storeConversation ).mockResolvedValue();
		vi.mocked( extractToolCallsFromMessage ).mockReturnValue( [] );
		vi.mocked( updateToolResultsWithResolvedPromises ).mockImplementation( ( parts ) => parts );
		vi.mocked( clearToolResultPromises ).mockReturnValue();
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
		expect( last.role ).toBe( 'user' );
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
		await waitFor( () => vi.mocked( mockClient.sendMessageStream ).mock.calls.length > 0 );

		expect( onSessionIdChange ).not.toHaveBeenCalled();
		expect( vi.mocked( storeConversation ).mock.calls ).toHaveLength( 0 );
	} );

	it( 'omits local-* session ids from the outbound stream request', async () => {
		mockClient.sendMessageStream.mockReturnValue( hangingStream() );

		await agentManager.createAgent( 'k', testConfig );

		const gen = agentManager.sendMessageStream( 'k', 'hello' );
		const iter = gen[ Symbol.asyncIterator ]();
		void iter.next();
		await waitFor( () => vi.mocked( mockClient.sendMessageStream ).mock.calls.length > 0 );

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
		await waitFor( () => vi.mocked( mockClient.sendMessageStream ).mock.calls.length > 0 );

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

		await drain( agentManager.sendMessageStream( 'k', 'hello' ) );

		expect( clearConversation ).toHaveBeenCalledWith( 'local-gen-id' );
		const serverPersists = vi
			.mocked( storeConversation )
			.mock.calls.filter( ( [ sid ] ) => sid === 'server-real' );
		expect( serverPersists.length ).toBeGreaterThan( 0 );
	} );
} );
