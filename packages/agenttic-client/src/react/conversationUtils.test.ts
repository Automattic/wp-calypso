import { describe, expect, it } from 'vitest';
import {
	conversationMessagesToDataParts,
	extractNewContentFromMessage,
	messageCarriesToolPayload,
} from './conversationUtils';
import type { A2uiDataPart, Message } from '../client/types/index';

const messageWithText = ( text: string ): Message => ( {
	role: 'agent',
	kind: 'message',
	messageId: 'test-id',
	parts: [ { type: 'text', text } ],
} );

describe( 'messageCarriesToolPayload', () => {
	it( 'matches a fully-formed tool payload (e.g. a picker)', () => {
		const payload = JSON.stringify( {
			tool_id: 'big_sky__show_component',
			data: { type: 'color-picker', props: { variations: [] } },
		} );
		expect( messageCarriesToolPayload( messageWithText( payload ) ) ).toBe( true );
	} );

	it( 'ignores plain agent prose (token-streamed text is not a payload)', () => {
		expect(
			messageCarriesToolPayload( messageWithText( 'Here are some red palettes — pick one!' ) )
		).toBe( false );
	} );

	it( 'ignores valid JSON that is not a tool payload', () => {
		expect( messageCarriesToolPayload( messageWithText( JSON.stringify( { foo: 'bar' } ) ) ) ).toBe(
			false
		);
	} );

	it( 'ignores a payload whose tool_id is not a string', () => {
		expect(
			messageCarriesToolPayload( messageWithText( JSON.stringify( { tool_id: 42 } ) ) )
		).toBe( false );
	} );

	it( 'ignores empty / whitespace text', () => {
		expect( messageCarriesToolPayload( messageWithText( '   ' ) ) ).toBe( false );
	} );

	it( 'ignores messages without a text part', () => {
		const toolResultOnly: Message = {
			role: 'agent',
			kind: 'message',
			messageId: 'test-id',
			parts: [
				{
					type: 'data',
					data: { toolCallId: 'abc', result: { success: true } },
				},
			],
		};
		expect( messageCarriesToolPayload( toolResultOnly ) ).toBe( false );
	} );

	it( 'handles an undefined message', () => {
		expect( messageCarriesToolPayload( undefined ) ).toBe( false );
	} );
} );

describe( 'interactive UI surfaces in history', () => {
	const surface: A2uiDataPart = {
		type: 'data',
		data: [ { version: 'v1.0', deleteSurface: { surfaceId: 'form' } } ],
		metadata: { mimeType: 'application/a2ui+json', postId: 7 },
	};

	const text = { type: 'text' as const, text: 'Here you go.' };

	const reply = ( parts: Message[ 'parts' ] ): Message => ( {
		role: 'agent',
		kind: 'message',
		messageId: 'reply',
		parts,
	} );

	it( 'keeps a surface in the conversation history', () => {
		expect( extractNewContentFromMessage( reply( [ surface ] ) ).parts ).toEqual( [ surface ] );
	} );

	it.each( [
		[ 'with the text before it', [ text, surface ], [ { text: 'Here you go.', a2ui: surface } ] ],
		[ 'on its own without text', [ surface ], [ { text: '', a2ui: surface } ] ],
	] )( 'sends a surface to the agent %s', ( _description, parts, items ) => {
		expect( conversationMessagesToDataParts( [ reply( parts ) ] ) ).toEqual(
			items.map( ( item ) => ( { type: 'data', data: { role: 'agent', ...item } } ) )
		);
	} );
} );
