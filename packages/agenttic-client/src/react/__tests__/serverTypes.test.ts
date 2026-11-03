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

	it( 'restores an interactive UI surface, even without text, and skips a malformed one', () => {
		const surface = {
			type: 'data',
			data: [ { version: 'v1.0', deleteSurface: { surfaceId: 'form' } } ],
			metadata: { mimeType: 'application/a2ui+json', postId: 7 },
		};
		const reply = ( a2ui: unknown ) =>
			serverMessageToMessage( { ...buildServerMessage( { a2ui } ), role: 'bot', content: '' } );

		expect( reply( surface ).parts ).toEqual( [ surface ] );
		expect( reply( { ...surface, data: 'not messages' } ).parts ).toEqual( [] );
	} );

	it.each( [
		[ 'the ID it had live', { a2a_message_id: 'a2a-1' }, 'a2a-1' ],
		[ 'its row ID when it has no live ID', {}, '1' ],
	] )( 'names a loaded message by %s', ( _description, fields, messageId ) => {
		const message = serverMessageToMessage( { ...buildServerMessage( undefined ), ...fields } );

		expect( message.messageId ).toBe( messageId );
	} );

	it( 'adds no data part for a context without flags, sources or prompt source', () => {
		const message = serverMessageToMessage( buildServerMessage( { url: 'https://example.com' } ) );

		expect( message.parts ).toEqual( [ { type: 'text', text: 'hello' } ] );
	} );
} );
