import { describe, expect, it } from 'vitest';
import type { Message } from '../client/types/index';
import { messageCarriesToolPayload } from './conversationUtils';

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
		expect( messageCarriesToolPayload( messageWithText( payload ) ) ).toBe(
			true
		);
	} );

	it( 'ignores plain agent prose (token-streamed text is not a payload)', () => {
		expect(
			messageCarriesToolPayload(
				messageWithText( 'Here are some red palettes — pick one!' )
			)
		).toBe( false );
	} );

	it( 'ignores valid JSON that is not a tool payload', () => {
		expect(
			messageCarriesToolPayload(
				messageWithText( JSON.stringify( { foo: 'bar' } ) )
			)
		).toBe( false );
	} );

	it( 'ignores a payload whose tool_id is not a string', () => {
		expect(
			messageCarriesToolPayload(
				messageWithText( JSON.stringify( { tool_id: 42 } ) )
			)
		).toBe( false );
	} );

	it( 'ignores empty / whitespace text', () => {
		expect( messageCarriesToolPayload( messageWithText( '   ' ) ) ).toBe(
			false
		);
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
