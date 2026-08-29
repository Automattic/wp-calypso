/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import type { Message } from '@automattic/agenttic-client';

const mockPrefix = 'a8c_agenttic_conversation_history_';
const STORAGE_PREFIX = mockPrefix;

const isUnresolved = ( message: Message ) =>
	message.metadata?.deliveryStatus === 'pending' ||
	message.metadata?.deliveryStatus === 'streaming';

jest.mock(
	'@automattic/agenttic-client',
	() => {
		// Minimal stand-ins for agenttic's sessionStorage-backed conversation store.
		const storedKeys = () =>
			Object.keys( globalThis.sessionStorage )
				.filter( ( key ) => key.startsWith( mockPrefix ) )
				.map( ( key ) => key.slice( mockPrefix.length ) );
		const restore = ( key: string ): Message[] =>
			JSON.parse(
				globalThis.sessionStorage.getItem( `${ mockPrefix }${ key }` ) ?? '{"messages":[]}'
			).messages.map(
				( m: {
					role: 'user' | 'agent';
					content: string;
					timestamp: number;
					deliveryStatus?: string;
				} ) => ( {
					role: m.role,
					kind: 'message',
					messageId: `m-${ m.timestamp }`,
					parts: [ { type: 'text', text: m.content } ],
					metadata: { timestamp: m.timestamp, deliveryStatus: m.deliveryStatus },
				} )
			);
		return {
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
			getStoredSessionIds: jest.fn( async () => storedKeys() ),
			loadConversation: jest.fn( async ( key: string ) => ( { messages: restore( key ) } ) ),
			clearConversation: jest.fn( async ( key: string ) =>
				globalThis.sessionStorage.removeItem( `${ mockPrefix }${ key }` )
			),
			messageTextContent: ( message: Message ) =>
				message.parts
					.filter( ( part ): part is { type: 'text'; text: string } => part.type === 'text' )
					.map( ( part ) => part.text )
					.join( '\n' ),
		};
	},
	{ virtual: true }
);

jest.mock( '../../contexts', () => ( {
	useAgentsManagerContext: jest.fn(),
} ) );

import { getUnresolvedMessages, reconcileWithServer } from '@automattic/agenttic-client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useAgentsManagerContext } from '../../contexts';
import useReconcileDeliveryStatus from '../use-reconcile-delivery-status';

const mockContext = useAgentsManagerContext as jest.Mock;
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

		expect( result.current.result!.failedTexts ).toEqual( [ 'go big' ] );
		// No message left unresolved, and the stale orphan is cleared.
		expect( getUnresolvedMessages( result.current.result!.messages ) ).toHaveLength( 0 );
		expect( sessionStorage.getItem( `${ STORAGE_PREFIX }local-1` ) ).toBeNull();
	} );

	it( 'ignores unresolved turns that belong to a server session', async () => {
		setAgent( 'wp-orchestrator', 'uuid-1' );
		seed( 'uuid-1', [ { role: 'user', content: 'q', deliveryStatus: 'pending' } ] );

		const { result } = renderHook( () => useReconcileDeliveryStatus() );
		await flush();

		expect( mockReconcile ).not.toHaveBeenCalled();
		expect( result.current.result ).toBeNull();
		expect( sessionStorage.getItem( `${ STORAGE_PREFIX }uuid-1` ) ).not.toBeNull();
	} );

	it( 'still picks up a local-* orphan when the agent resumes another session', async () => {
		setAgent( 'wp-orchestrator', 'uuid-mine' );
		seed( 'local-1', [ { role: 'user', content: 'q', deliveryStatus: 'pending' } ] );

		const { result } = renderHook( () => useReconcileDeliveryStatus() );
		await waitFor( () => expect( result.current.result ).not.toBeNull() );

		expect( result.current.result!.failedTexts ).toEqual( [ 'q' ] );
	} );
} );
