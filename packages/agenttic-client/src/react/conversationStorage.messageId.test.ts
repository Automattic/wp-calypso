import { beforeEach, describe, expect, it, vi } from 'vitest';

const STORAGE_KEY = 'a8c_agenttic_conversation_history_session';

// A fresh module instance reads sessionStorage the way a reloaded page does.
async function reloadFromStorage() {
	vi.resetModules();
	const { loadConversation } = await import( './conversationStorage' );
	const { messages } = await loadConversation( 'session' );

	return messages;
}

describe( 'conversationStorage — message ID', () => {
	beforeEach( async () => {
		sessionStorage.clear();
		vi.resetModules();

		const { storeConversation } = await import( './conversationStorage' );
		await storeConversation( 'session', [
			{ role: 'agent', kind: 'message', messageId: '42', parts: [ { type: 'text', text: 'Hi' } ] },
		] );
	} );

	it( 'keeps each message’s ID through sessionStorage', async () => {
		const messages = await reloadFromStorage();

		expect( messages[ 0 ]?.messageId ).toBe( '42' );
	} );

	it( 'gives a message stored without an ID, by an older version, a new one', async () => {
		const stored = JSON.parse( sessionStorage.getItem( STORAGE_KEY ) ?? '{}' );
		delete stored.messages[ 0 ].messageId;
		sessionStorage.setItem( STORAGE_KEY, JSON.stringify( stored ) );

		const messages = await reloadFromStorage();

		expect( messages[ 0 ]?.messageId ).toEqual( expect.any( String ) );
	} );
} );
