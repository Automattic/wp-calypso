/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import type { Message } from '@automattic/agenttic-client';

const isUnresolved = ( message: Message ) =>
	message.metadata?.deliveryStatus === 'pending' ||
	message.metadata?.deliveryStatus === 'streaming';

jest.mock(
	'@automattic/agenttic-client',
	() => ( {
		getUnresolvedMessages: jest.fn( ( messages: Message[] ) => messages.filter( isUnresolved ) ),
		// Mimics the real primitive closely enough to exercise the hook's wiring:
		// server transcript wins when present, otherwise unresolved turns fail.
		reconcileWithServer: jest.fn( async ( messages: Message[], fetchServer ) => {
			const server = await fetchServer();
			if ( server && server.length > 0 ) {
				return server;
			}
			return messages.map( ( message: Message ) =>
				isUnresolved( message )
					? {
							...message,
							metadata: { ...( message.metadata || {} ), deliveryStatus: 'failed' },
					  }
					: message
			);
		} ),
		loadAllMessagesFromServer: jest.fn(),
		CONVERSATION_STORAGE_KEY: 'a8c_agenttic_conversation_history',
	} ),
	{ virtual: true }
);

jest.mock( '../../contexts', () => ( {
	useAgentsManagerContext: jest.fn(),
} ) );

jest.mock( '../../utils/conversation-bot-id', () => ( {
	getConversationBotId: jest.fn( () => 'wpcom-agent-wp_orchestrator' ),
} ) );

import {
	getUnresolvedMessages,
	loadAllMessagesFromServer,
	reconcileWithServer,
} from '@automattic/agenttic-client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useAgentsManagerContext } from '../../contexts';
import { STORAGE_PREFIX } from '../../utils/conversation-storage-read';
import useReconcileDeliveryStatus from '../use-reconcile-delivery-status';

const mockContext = useAgentsManagerContext as jest.Mock;
const mockLoadAll = loadAllMessagesFromServer as jest.Mock;
const mockReconcile = reconcileWithServer as jest.Mock;

function seed(
	storageKey: string,
	messages: Array< { role: 'user' | 'agent'; content: string; deliveryStatus?: string } >,
	lastUpdated = 1
): void {
	sessionStorage.setItem(
		`${ STORAGE_PREFIX }${ storageKey }`,
		JSON.stringify( {
			storageKey,
			lastUpdated,
			messages: messages.map( ( m, i ) => ( { ...m, timestamp: i + 1 } ) ),
		} )
	);
}

function setAgent( agentId = 'wp-orchestrator', sessionId?: string ): void {
	mockContext.mockReturnValue( { agentConfig: { agentId, sessionId, authProvider: {} } } );
}

async function flush(): Promise< void > {
	await act( async () => {
		await Promise.resolve();
	} );
}

describe( 'useReconcileDeliveryStatus', () => {
	beforeEach( () => {
		sessionStorage.clear();
		mockLoadAll.mockReset();
		mockReconcile.mockClear();
		( getUnresolvedMessages as jest.Mock ).mockClear();
	} );

	it( 'skips Reader Chat', async () => {
		setAgent( 'reader-chat' );
		seed( 'local-1', [ { role: 'user', content: 'q', deliveryStatus: 'pending' } ] );

		const { result } = renderHook( () => useReconcileDeliveryStatus() );
		await flush();

		expect( mockReconcile ).not.toHaveBeenCalled();
		expect( result.current.result ).toBeNull();
	} );

	it( 'is a no-op when nothing is unresolved', async () => {
		setAgent();
		seed( 'server-uuid', [ { role: 'user', content: 'q', deliveryStatus: 'complete' } ] );

		const { result } = renderHook( () => useReconcileDeliveryStatus() );
		await flush();

		expect( mockReconcile ).not.toHaveBeenCalled();
		expect( result.current.result ).toBeNull();
	} );

	it( 'marks a local-* orphan failed without hitting the server (fast switch)', async () => {
		setAgent();
		seed( 'local-1', [ { role: 'user', content: 'go big', deliveryStatus: 'pending' } ] );

		const { result } = renderHook( () => useReconcileDeliveryStatus() );
		await waitFor( () => expect( result.current.result ).not.toBeNull() );

		expect( mockLoadAll ).not.toHaveBeenCalled();
		expect( result.current.result!.outcome ).toBe( 'failed' );
		expect( result.current.result!.serverSessionId ).toBeNull();
		expect( result.current.result!.failedTexts ).toEqual( [ 'go big' ] );
		// No message left unresolved, and the stale orphan is cleared.
		expect( getUnresolvedMessages( result.current.result!.messages ) ).toHaveLength( 0 );
		expect( sessionStorage.getItem( `${ STORAGE_PREFIX }local-1` ) ).toBeNull();
	} );

	it( 'adopts the server transcript and syncs the session (thinking switch)', async () => {
		setAgent( 'wp-orchestrator', 'uuid-1' );
		seed( 'uuid-1', [ { role: 'user', content: 'q', deliveryStatus: 'pending' } ] );
		mockLoadAll.mockResolvedValue( {
			messages: [
				{
					role: 'user',
					kind: 'message',
					messageId: 's1',
					parts: [ { type: 'text', text: 'q' } ],
					metadata: { deliveryStatus: 'complete' },
				},
				{
					role: 'agent',
					kind: 'message',
					messageId: 's2',
					parts: [ { type: 'text', text: 'here you go' } ],
				},
			],
		} );

		const { result } = renderHook( () => useReconcileDeliveryStatus() );
		await waitFor( () => expect( result.current.result ).not.toBeNull() );

		expect( mockLoadAll ).toHaveBeenCalledTimes( 1 );
		expect( result.current.result!.outcome ).toBe( 'server' );
		expect( result.current.result!.serverSessionId ).toBe( 'uuid-1' );
		expect( getUnresolvedMessages( result.current.result!.messages ) ).toHaveLength( 0 );
		// A live session's transcript is preserved, not cleared.
		expect( sessionStorage.getItem( `${ STORAGE_PREFIX }uuid-1` ) ).not.toBeNull();
	} );

	it( 'leaves the turn pending when the server fetch throws (offline)', async () => {
		setAgent( 'wp-orchestrator', 'uuid-1' );
		seed( 'uuid-1', [ { role: 'user', content: 'q', deliveryStatus: 'pending' } ] );
		// The real primitive swallows fetch errors and returns the input unchanged.
		mockReconcile.mockImplementationOnce( async ( messages: Message[], fetchServer ) => {
			try {
				await fetchServer();
			} catch {
				return messages;
			}
			return messages;
		} );
		mockLoadAll.mockRejectedValue( new Error( 'offline' ) );

		const { result } = renderHook( () => useReconcileDeliveryStatus() );
		await flush();
		await flush();

		// Still unresolved → no result surfaced, storage untouched for a later retry.
		expect( mockReconcile ).toHaveBeenCalledTimes( 1 );
		expect( result.current.result ).toBeNull();
		expect( sessionStorage.getItem( `${ STORAGE_PREFIX }uuid-1` ) ).not.toBeNull();
	} );

	it( 'ignores an unresolved server session that is not the one this agent resumes', async () => {
		setAgent( 'wp-orchestrator', 'uuid-mine' );
		seed( 'uuid-other-agent', [ { role: 'user', content: 'q', deliveryStatus: 'pending' } ], 5 );

		const { result } = renderHook( () => useReconcileDeliveryStatus() );
		await flush();

		expect( mockReconcile ).not.toHaveBeenCalled();
		expect( mockLoadAll ).not.toHaveBeenCalled();
		expect( result.current.result ).toBeNull();
		expect( sessionStorage.getItem( `${ STORAGE_PREFIX }uuid-other-agent` ) ).not.toBeNull();
	} );

	it( 'still picks up a local-* orphan when the agent resumes another session', async () => {
		setAgent( 'wp-orchestrator', 'uuid-mine' );
		seed( 'local-1', [ { role: 'user', content: 'q', deliveryStatus: 'pending' } ] );

		const { result } = renderHook( () => useReconcileDeliveryStatus() );
		await waitFor( () => expect( result.current.result ).not.toBeNull() );

		expect( result.current.result!.outcome ).toBe( 'failed' );
		expect( result.current.result!.failedTexts ).toEqual( [ 'q' ] );
	} );

	it( 'clears the stored entry when the server session lacks the orphaned turn', async () => {
		setAgent( 'wp-orchestrator', 'uuid-1' );
		seed( 'uuid-1', [
			{ role: 'user', content: 'first', deliveryStatus: 'complete' },
			{ role: 'user', content: 'lost', deliveryStatus: 'pending' },
		] );
		const server = [
			{
				role: 'user',
				kind: 'message',
				messageId: 's1',
				parts: [ { type: 'text', text: 'first' } ],
				metadata: { deliveryStatus: 'complete' },
			},
		];
		mockLoadAll.mockResolvedValue( { messages: server } );
		mockReconcile.mockImplementationOnce( async ( messages: Message[], fetchServer ) => {
			const fetched = await fetchServer();
			return [
				...fetched,
				{ ...messages[ 1 ], metadata: { ...messages[ 1 ].metadata, deliveryStatus: 'failed' } },
			];
		} );

		const { result } = renderHook( () => useReconcileDeliveryStatus() );
		await waitFor( () => expect( result.current.result ).not.toBeNull() );

		expect( result.current.result!.outcome ).toBe( 'server' );
		expect( result.current.result!.failedTexts ).toEqual( [ 'lost' ] );
		expect( sessionStorage.getItem( `${ STORAGE_PREFIX }uuid-1` ) ).toBeNull();
	} );
} );
