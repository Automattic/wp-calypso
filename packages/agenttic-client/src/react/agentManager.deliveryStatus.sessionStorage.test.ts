/**
 * Unmocked sessionStorage integration for the WOOAI-872 path.
 *
 * Unlike `agentManager.deliveryStatus.test.ts` (which mocks
 * `storeConversation`), this file uses the real conversationStorage
 * round-trip so CI asserts the same claim the local demo harness does:
 * after a hanging/aborted stream, a `local-*` key exists in sessionStorage
 * and the last user message carries `deliveryStatus: 'pending'`.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ClientConfig, TaskUpdate } from '../client/types/index';

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

const STORAGE_PREFIX = 'a8c_agenttic_conversation_history_';

interface StoredMessage {
	role: string;
	content: string;
	deliveryStatus?: string;
}

interface StoredConversation {
	storageKey: string;
	messages: StoredMessage[];
}

function hangingStream() {
	return {
		[ Symbol.asyncIterator ]: () => ( {
			next: () =>
				new Promise< IteratorResult< TaskUpdate > >( () => undefined ),
		} ),
	};
}

async function waitFor( predicate: () => boolean ): Promise< void > {
	await vi.waitFor( () => {
		expect( predicate() ).toBe( true );
	} );
}

function readAgentticEntries(): Record< string, StoredConversation > {
	const out: Record< string, StoredConversation > = {};
	for ( let i = 0; i < sessionStorage.length; i++ ) {
		const key = sessionStorage.key( i );
		if ( ! key || ! key.startsWith( STORAGE_PREFIX ) ) {
			continue;
		}
		const raw = sessionStorage.getItem( key );
		if ( ! raw ) {
			continue;
		}
		out[ key ] = JSON.parse( raw ) as StoredConversation;
	}
	return out;
}

describe( 'agentManager.sendMessageStream — real sessionStorage (WOOAI-872)', () => {
	let agentManager: AgentManager;
	let mockClient: {
		sendMessage: ReturnType< typeof vi.fn >;
		sendMessageStream: ReturnType< typeof vi.fn >;
	};

	const testConfig: ClientConfig = {
		agentId: 'test-agent',
		agentUrl: 'https://example.com/agent',
	};

	beforeEach( () => {
		vi.clearAllMocks();
		sessionStorage.clear();
		agentManager = getAgentManager();
		agentManager.clear();

		mockClient = {
			sendMessage: vi.fn(),
			sendMessageStream: vi.fn(),
		};

		vi.mocked( createClient ).mockReturnValue( mockClient as any );
		vi.mocked( createTextMessage ).mockImplementation(
			( text: string ) => ( {
				role: 'user' as const,
				kind: 'message' as const,
				parts: [ { type: 'text' as const, text } ],
				messageId: `msg-${ text }`,
				metadata: { timestamp: 0 },
			} )
		);
		vi.mocked( extractToolCallsFromMessage ).mockReturnValue( [] );
		vi.mocked( updateToolResultsWithResolvedPromises ).mockImplementation(
			( parts ) => parts
		);
		vi.mocked( clearToolResultPromises ).mockReturnValue();
	} );

	it( 'writes pending user message to a local-* sessionStorage key when the stream hangs', async () => {
		mockClient.sendMessageStream.mockReturnValue( hangingStream() );

		await agentManager.createAgent( 'k', testConfig );

		const gen = agentManager.sendMessageStream(
			'k',
			'hello from sessionStorage integration'
		);
		const iter = gen[ Symbol.asyncIterator ]();
		void iter.next();

		await waitFor( () => {
			const entries = readAgentticEntries();
			return Object.keys( entries ).some( ( key ) =>
				key.includes( `${ STORAGE_PREFIX }local-` )
			);
		} );

		const entries = readAgentticEntries();
		const localKeys = Object.keys( entries ).filter( ( key ) =>
			key.includes( `${ STORAGE_PREFIX }local-` )
		);
		expect( localKeys ).toHaveLength( 1 );

		const stored = entries[ localKeys[ 0 ]! ]!;
		expect( stored.storageKey ).toMatch( /^local-/ );
		expect( stored.messages.length ).toBeGreaterThan( 0 );

		const last = stored.messages[ stored.messages.length - 1 ]!;
		expect( last.role ).toBe( 'user' );
		expect( last.content ).toBe( 'hello from sessionStorage integration' );
		expect( last.deliveryStatus ).toBe( 'pending' );

		agentManager.abortCurrentRequest( 'k' );
	} );
} );
