import { describe, expect, it } from 'vitest';
import { serverMessageToMessage, type ServerMessage } from '../serverTypes';

const buildServerMessage = ( context: ServerMessage[ 'context' ] ): ServerMessage => ( {
	message_id: 1,
	role: 'user',
	content: 'hello',
	context,
	created_at: '2026-10-14 12:00:00',
} );

describe( 'serverMessageToMessage', () => {
	it( 'restores the prompt source as a data part', () => {
		const message = serverMessageToMessage(
			buildServerMessage( {
				promptSource: 'site-setup-checklist',
				promptSourceId: 'design',
				source: 'sitespec',
				url: 'https://example.com',
			} )
		);

		expect( message.parts ).toEqual( [
			{ type: 'text', text: 'hello' },
			{ type: 'data', data: { promptSource: 'site-setup-checklist', promptSourceId: 'design' } },
		] );
	} );

	it( 'adds no data part for a context without flags, sources or prompt source', () => {
		const message = serverMessageToMessage( buildServerMessage( { url: 'https://example.com' } ) );

		expect( message.parts ).toEqual( [ { type: 'text', text: 'hello' } ] );
	} );
} );
