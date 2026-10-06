import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadChatFromServer } from '../odieService';

const emptyChat = {
	chat_id: 1,
	bot_id: 'bot',
	messages: [],
	created_at: '2026-10-06 10:00:00',
};

function requestedUrl( fetchMock: ReturnType< typeof vi.fn > ): URL {
	return new URL( fetchMock.mock.calls[ 0 ][ 0 ] as string );
}

describe( 'loadChatFromServer', () => {
	afterEach( () => {
		vi.unstubAllGlobals();
	} );

	it( 'asks the server for tool messages when the caller wants them', async () => {
		const fetchMock = vi.fn().mockResolvedValue( new Response( JSON.stringify( emptyChat ) ) );
		vi.stubGlobal( 'fetch', fetchMock );

		await loadChatFromServer( 'chat-1', { botId: 'bot' }, 1, 50, true );

		expect( requestedUrl( fetchMock ).searchParams.get( 'include_tool_messages' ) ).toBe( 'true' );
	} );

	it( 'leaves tool messages out by default', async () => {
		const fetchMock = vi.fn().mockResolvedValue( new Response( JSON.stringify( emptyChat ) ) );
		vi.stubGlobal( 'fetch', fetchMock );

		await loadChatFromServer( 'chat-1', { botId: 'bot' } );

		expect( requestedUrl( fetchMock ).searchParams.has( 'include_tool_messages' ) ).toBe( false );
	} );
} );
