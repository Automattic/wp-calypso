import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
	loadConversation,
	storeConversation,
	getUnresolvedMessages,
	reconcileWithServer,
	type DeliveryStatus,
} from './conversationStorage';
import type { Message } from '../client/types/index';

function makeUserMessage( text: string, deliveryStatus?: DeliveryStatus ): Message {
	return {
		role: 'user',
		kind: 'message',
		messageId: `id-${ text }`,
		parts: [ { type: 'text', text } ],
		metadata: {
			timestamp: 1_700_000_000_000,
			...( deliveryStatus && { deliveryStatus } ),
		},
	};
}

describe( 'conversationStorage — deliveryStatus reconciliation', () => {
	beforeEach( () => {
		if ( typeof sessionStorage !== 'undefined' ) {
			sessionStorage.clear();
		}
	} );

	it( 'round-trips deliveryStatus through storage', async () => {
		const sessionId = 'session-1';
		await storeConversation( sessionId, [
			makeUserMessage( 'first', 'sent' ),
			makeUserMessage( 'second', 'pending' ),
		] );

		const loaded = await loadConversation( sessionId );

		expect( loaded.messages[ 0 ]?.metadata?.deliveryStatus ).toBe( 'sent' );
		expect( loaded.messages[ 1 ]?.metadata?.deliveryStatus ).toBe( 'pending' );
	} );

	it( 'omits deliveryStatus when caller did not set it (back-compat)', async () => {
		const sessionId = 'session-2';
		await storeConversation( sessionId, [ makeUserMessage( 'legacy' ) ] );

		const loaded = await loadConversation( sessionId );

		expect( loaded.messages[ 0 ]?.metadata?.deliveryStatus ).toBeUndefined();
	} );

	it( 'getUnresolvedMessages returns pending + streaming, ignores others', () => {
		const messages: Message[] = [
			makeUserMessage( 'legacy' ),
			makeUserMessage( 'ok', 'sent' ),
			makeUserMessage( 'wire-1', 'pending' ),
			makeUserMessage( 'wire-2', 'streaming' ),
			makeUserMessage( 'done', 'complete' ),
			makeUserMessage( 'gone', 'failed' ),
		];

		const unresolved = getUnresolvedMessages( messages );
		const texts = unresolved.map(
			( m ) =>
				(
					m.parts.find( ( p ) => p.type === 'text' ) as {
						text: string;
					}
				 ).text
		);

		expect( texts ).toEqual( [ 'wire-1', 'wire-2' ] );
	} );

	it( 'reconcileWithServer is a no-op when nothing is unresolved', async () => {
		const messages: Message[] = [ makeUserMessage( 'ok', 'sent' ) ];
		const fetcher = vi.fn( () => Promise.resolve( null ) );

		const result = await reconcileWithServer( messages, fetcher );

		expect( result ).toBe( messages );
		expect( fetcher ).not.toHaveBeenCalled();
	} );

	it( 'reconcileWithServer prefers server state when available', async () => {
		const local: Message[] = [ makeUserMessage( 'q', 'pending' ) ];
		const serverMessages: Message[] = [
			makeUserMessage( 'q', 'sent' ),
			{
				role: 'agent',
				kind: 'message',
				messageId: 'server-reply',
				parts: [ { type: 'text', text: 'a' } ],
			},
		];
		const fetcher = () => Promise.resolve( serverMessages );

		const result = await reconcileWithServer( local, fetcher );

		expect( result ).toBe( serverMessages );
	} );

	it( 'reconcileWithServer appends local-only pending as failed when server has prior history', async () => {
		const local: Message[] = [
			makeUserMessage( 'old', 'complete' ),
			makeUserMessage( 'aborted-send', 'pending' ),
		];
		const serverMessages: Message[] = [
			makeUserMessage( 'old', 'complete' ),
			{
				role: 'agent',
				kind: 'message',
				messageId: 'server-reply',
				parts: [ { type: 'text', text: 'prior reply' } ],
			},
		];
		const fetcher = () => Promise.resolve( serverMessages );

		const result = await reconcileWithServer( local, fetcher );

		expect( result ).toHaveLength( 3 );
		expect( result.slice( 0, 2 ) ).toEqual( serverMessages );
		expect( result[ 2 ]?.metadata?.deliveryStatus ).toBe( 'failed' );
		expect(
			(
				result[ 2 ]?.parts.find( ( p ) => p.type === 'text' ) as {
					text: string;
				}
			 ).text
		).toBe( 'aborted-send' );
	} );

	it( 'reconcileWithServer marks unresolved as failed when server has nothing', async () => {
		const local: Message[] = [ makeUserMessage( 'orphan', 'pending' ) ];
		const fetcher = () => Promise.resolve( null );

		const result = await reconcileWithServer( local, fetcher );

		expect( result[ 0 ]?.metadata?.deliveryStatus ).toBe( 'failed' );
	} );

	it( 'reconcileWithServer marks unresolved as failed when server returns empty', async () => {
		const local: Message[] = [ makeUserMessage( 'orphan', 'pending' ) ];
		const fetcher = () => Promise.resolve( [] );

		const result = await reconcileWithServer( local, fetcher );

		expect( result[ 0 ]?.metadata?.deliveryStatus ).toBe( 'failed' );
	} );

	it( 'reconcileWithServer leaves unresolved pending on fetcher error', async () => {
		const local: Message[] = [ makeUserMessage( 'orphan', 'streaming' ) ];
		const fetcher = () => Promise.reject( new Error( 'offline' ) );

		const result = await reconcileWithServer( local, fetcher );

		expect( result ).toBe( local );
		expect( result[ 0 ]?.metadata?.deliveryStatus ).toBe( 'streaming' );
	} );

	it( 'reconcileWithServer only flips unresolved entries in a mixed transcript', async () => {
		const local: Message[] = [
			makeUserMessage( 'done', 'complete' ),
			makeUserMessage( 'orphan', 'pending' ),
		];
		const fetcher = () => Promise.resolve( null );

		const result = await reconcileWithServer( local, fetcher );

		expect( result[ 0 ]?.metadata?.deliveryStatus ).toBe( 'complete' );
		expect( result[ 1 ]?.metadata?.deliveryStatus ).toBe( 'failed' );
	} );

	it( 'reconcileWithServer treats extra same-text pending as failed', async () => {
		const local: Message[] = [
			makeUserMessage( 'hi', 'complete' ),
			makeUserMessage( 'hi', 'pending' ),
		];
		const serverMessages: Message[] = [
			makeUserMessage( 'hi', 'sent' ),
			{
				role: 'agent',
				kind: 'message',
				messageId: 'server-reply',
				parts: [ { type: 'text', text: 'a' } ],
			},
		];
		const fetcher = () => Promise.resolve( serverMessages );

		const result = await reconcileWithServer( local, fetcher );

		expect( result ).toHaveLength( 3 );
		expect( result.slice( 0, 2 ) ).toEqual( serverMessages );
		expect( result[ 2 ]?.metadata?.deliveryStatus ).toBe( 'failed' );
		expect(
			(
				result[ 2 ]?.parts.find( ( p ) => p.type === 'text' ) as {
					text: string;
				}
			 ).text
		).toBe( 'hi' );
	} );
} );
