import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Message } from '../client/types/index';

const base = ( messageId: string ): Message => ( {
	role: 'user',
	kind: 'message',
	messageId,
	parts: [ { type: 'text', text: 'Help me with: design' } ],
	metadata: { timestamp: 1_700_000_000_000 },
} );

// `loadConversation` serves an in-memory cache first; a fresh module instance
// reads sessionStorage the way a reloaded page does.
async function storeThenReloadFromStorage( sessionId: string, messages: Message[] ) {
	const { storeConversation } = await import( './conversationStorage' );
	await storeConversation( sessionId, messages );
	vi.resetModules();
	const [ { loadConversation }, { transformClientMessageToUI } ] = await Promise.all( [
		import( './conversationStorage' ),
		import( './useAgentChat' ),
	] );
	const { messages: restored } = await loadConversation( sessionId );
	return { restored, transformClientMessageToUI };
}

describe( 'conversationStorage — prompt source', () => {
	beforeEach( () => {
		sessionStorage.clear();
		vi.resetModules();
	} );

	it( 'round-trips a live message’s prompt source metadata through sessionStorage', async () => {
		const { restored, transformClientMessageToUI } = await storeThenReloadFromStorage(
			'session-1',
			[
				{
					...base( 'live' ),
					metadata: {
						timestamp: 1_700_000_000_000,
						promptSource: 'site-setup-checklist',
						promptSourceId: 'design',
					},
				},
			]
		);

		expect( restored[ 0 ]?.metadata ).toMatchObject( {
			promptSource: 'site-setup-checklist',
			promptSourceId: 'design',
		} );
		expect( transformClientMessageToUI( restored[ 0 ] )?.content ).toContainEqual( {
			type: 'data',
			data: { promptSource: 'site-setup-checklist', promptSourceId: 'design' },
		} );
	} );

	it( 'round-trips a prompt source restored from the server as a data part', async () => {
		const { restored } = await storeThenReloadFromStorage( 'session-2', [
			{
				...base( 'restored' ),
				parts: [
					{ type: 'text', text: 'Help me with: design' },
					{
						type: 'data',
						data: { promptSource: 'site-setup-checklist', promptSourceId: 'design' },
					},
				],
			},
		] );

		expect( restored[ 0 ]?.metadata ).toMatchObject( {
			promptSource: 'site-setup-checklist',
			promptSourceId: 'design',
		} );
	} );

	it( 'stores nothing for messages without a prompt source', async () => {
		const { restored, transformClientMessageToUI } = await storeThenReloadFromStorage(
			'session-3',
			[ base( 'plain' ) ]
		);

		expect( restored[ 0 ]?.metadata ).not.toHaveProperty( 'promptSource' );
		expect( transformClientMessageToUI( restored[ 0 ] )?.content ).toEqual( [
			{ type: 'text', text: 'Help me with: design' },
		] );
	} );
} );
