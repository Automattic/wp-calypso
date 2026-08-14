/**
 * @jest-environment jsdom
 */
import {
	STORAGE_PREFIX,
	clearStoredConversation,
	isLocalSessionKey,
	listStoredConversations,
} from '../conversation-storage-read';

interface SeedMessage {
	role: 'user' | 'agent';
	content: string;
	timestamp: number;
	deliveryStatus?: string;
}

function seedConversation(
	storageKey: string,
	messages: SeedMessage[],
	lastUpdated = 1_700_000_000_000
): void {
	sessionStorage.setItem(
		`${ STORAGE_PREFIX }${ storageKey }`,
		JSON.stringify( { storageKey, messages, lastUpdated } )
	);
}

function storedKeys(): string[] {
	return listStoredConversations()
		.map( ( conversation ) => conversation.storageKey )
		.sort();
}

describe( 'conversation-storage-read', () => {
	afterEach( () => {
		sessionStorage.clear();
	} );

	it( 'flags client-minted local- keys and not server UUIDs', () => {
		expect( isLocalSessionKey( 'local-abc123' ) ).toBe( true );
		expect( isLocalSessionKey( '550e8400-e29b-41d4-a716-446655440000' ) ).toBe( false );
	} );

	it( 'restores a pending user message with its deliveryStatus', () => {
		seedConversation( 'local-1', [
			{ role: 'user', content: 'set up black friday', timestamp: 1, deliveryStatus: 'pending' },
		] );

		const [ conversation ] = listStoredConversations();

		expect( conversation.storageKey ).toBe( 'local-1' );
		expect( conversation.messages ).toHaveLength( 1 );
		const [ message ] = conversation.messages;
		expect( message.role ).toBe( 'user' );
		expect( message.parts[ 0 ] ).toEqual( { type: 'text', text: 'set up black friday' } );
		expect( message.metadata?.deliveryStatus ).toBe( 'pending' );
	} );

	it( 'enumerates agenttic keys only, skipping foreign and malformed entries', () => {
		seedConversation( 'local-1', [
			{ role: 'user', content: 'a', timestamp: 1, deliveryStatus: 'pending' },
		] );
		seedConversation( 'server-uuid', [ { role: 'user', content: 'b', timestamp: 2 } ] );
		sessionStorage.setItem( 'unrelated-key', 'x' );
		sessionStorage.setItem( `${ STORAGE_PREFIX }bad`, '{not json' );

		expect( storedKeys() ).toEqual( [ 'local-1', 'server-uuid' ] );
	} );

	it( 'clears a single conversation and leaves the others', () => {
		seedConversation( 'local-1', [ { role: 'user', content: 'a', timestamp: 1 } ] );
		seedConversation( 'local-2', [ { role: 'user', content: 'b', timestamp: 2 } ] );

		clearStoredConversation( 'local-1' );

		expect( storedKeys() ).toEqual( [ 'local-2' ] );
	} );
} );
