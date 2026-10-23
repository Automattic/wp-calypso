import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { A2uiDataPart } from '../client/types/index';

describe( 'conversationStorage — interactive UI surface', () => {
	beforeEach( () => {
		sessionStorage.clear();
		vi.resetModules();
	} );

	it( 'round-trips a reply’s surface through sessionStorage, even without text', async () => {
		const surface: A2uiDataPart = {
			type: 'data',
			data: [ { version: 'v1.0', deleteSurface: { surfaceId: 'form' } } ],
			metadata: { mimeType: 'application/a2ui+json', postId: 7 },
		};

		const { storeConversation } = await import( './conversationStorage' );
		await storeConversation( 'session', [
			{ role: 'agent', kind: 'message', messageId: 'reply', parts: [ surface ] },
		] );

		// A fresh module instance reads sessionStorage the way a reloaded page does.
		vi.resetModules();
		const { loadConversation } = await import( './conversationStorage' );
		const { messages } = await loadConversation( 'session' );

		expect( messages[ 0 ]?.parts ).toEqual( [ surface ] );
	} );
} );
