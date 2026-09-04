import { deduplicateZDMessages, isQueuedZendeskMessage } from '../deduplicate-zd-messages';
import type { Message } from '../../types';

const userMessage = ( temporaryId: string, extra: Partial< Message > = {} ): Message =>
	( {
		content: `text ${ temporaryId }`,
		role: 'user',
		type: 'message',
		metadata: { temporary_id: temporaryId },
		...extra,
	} ) as Message;

const agentMessage = ( id: string, extra: Partial< Message > = {} ): Message =>
	( {
		content: `agent ${ id }`,
		role: 'business',
		type: 'message',
		id,
		received: 1700000000,
		...extra,
	} ) as Message;

describe( 'deduplicateZDMessages', () => {
	it( 'keeps distinct messages in their original order', () => {
		const messages = [ userMessage( 'a' ), agentMessage( 'x' ), userMessage( 'b' ) ];

		expect( deduplicateZDMessages( messages ) ).toEqual( messages );
	} );

	it( 'lets the server echo replace a mirrored placeholder in place', () => {
		// A copy mirrored from another tab: stamped as sent, but without the Smooch id.
		const placeholder = userMessage( 'a', { received: 1700000000 } );
		// The server's echo of the same message, with everything the server assigns.
		const echo = userMessage( 'a', { id: 'smooch-1', received: 1700000001, content: 'text a' } );
		const other = agentMessage( 'x' );

		expect( deduplicateZDMessages( [ placeholder, other, echo ] ) ).toEqual( [ echo, other ] );
	} );

	it( 'lets the re-downloaded history replace a queued copy', () => {
		const queued = userMessage( 'a' );
		const fromServer = userMessage( 'a', { id: 'smooch-1', received: 1700000000 } );

		expect( deduplicateZDMessages( [ queued, fromServer ] ) ).toEqual( [ fromServer ] );
	} );

	it( 'never overwrites a confirmed message with an unsent copy', () => {
		const confirmed = userMessage( 'a', { id: 'smooch-1', received: 1700000000 } );
		const unsent = userMessage( 'a' );

		expect( deduplicateZDMessages( [ confirmed, unsent ] ) ).toEqual( [ confirmed ] );
	} );

	it( 'keeps every message that has no identifier', () => {
		const anonymous = { content: 'hi', role: 'bot', type: 'message' } as Message;

		expect( deduplicateZDMessages( [ anonymous, anonymous ] ) ).toEqual( [ anonymous, anonymous ] );
	} );
} );

describe( 'isQueuedZendeskMessage', () => {
	it( 'matches a user message with a temporary id', () => {
		expect( isQueuedZendeskMessage( userMessage( 'a' ) ) ).toBe( true );
	} );

	it( 'does not match an Odie user message or an agent message', () => {
		const odieUserMessage = { content: 'hi', role: 'user', type: 'message' } as Message;

		expect( isQueuedZendeskMessage( odieUserMessage ) ).toBe( false );
		expect( isQueuedZendeskMessage( agentMessage( 'x' ) ) ).toBe( false );
	} );
} );
