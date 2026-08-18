import { describe, expect, it } from 'vitest';
import type { Message as ClientMessage } from '../../client/types/index';
import {
	canRegenerateAgentMessage,
	getLatestRegeneratableAgentMessageId,
	getRegenerateRequest,
} from '../regenerate';

const clientMessage = (
	messageId: string,
	role: 'user' | 'agent',
	text: string,
	metadata?: Record< string, unknown >
): ClientMessage => ( {
	messageId,
	role,
	kind: 'message',
	parts: [
		{
			type: 'text',
			text,
			...( metadata ? { metadata } : {} ),
		},
	],
	metadata: { timestamp: 1 },
} );

describe( 'regenerate message helpers', () => {
	it( 'identifies agent messages with a user prompt', () => {
		const clientMessages = [
			clientMessage( 'user-1', 'user', 'First prompt' ),
			clientMessage( 'agent-1', 'agent', 'First answer' ),
			clientMessage( 'user-2', 'user', 'Second prompt' ),
			clientMessage( 'agent-2', 'agent', 'Second answer' ),
		];

		expect( canRegenerateAgentMessage( clientMessages, 'agent-2' ) ).toBe(
			true
		);
		expect( canRegenerateAgentMessage( clientMessages, 'user-2' ) ).toBe(
			false
		);
		expect(
			canRegenerateAgentMessage( clientMessages, 'ui-only-agent' )
		).toBe( false );
	} );

	it( 'builds a truncated retry from the matching user turn', () => {
		const firstUser = clientMessage( 'user-1', 'user', 'First prompt' );
		const firstAgent = clientMessage( 'agent-1', 'agent', 'First answer' );
		const secondUser: ClientMessage = {
			messageId: 'user-2',
			role: 'user',
			kind: 'message',
			metadata: { timestamp: 2 },
			parts: [
				{
					type: 'text',
					text: 'Hidden context',
					metadata: { contentType: 'context' },
				},
				{ type: 'text', text: 'Visible prompt' },
				{
					type: 'file',
					file: {
						name: 'flower.png',
						mimeType: 'image/png',
						uri: 'https://example.com/flower.png',
					},
				},
			],
		};
		const secondAgent = clientMessage(
			'agent-2',
			'agent',
			'Second answer'
		);
		const laterUser = clientMessage( 'user-3', 'user', 'Later prompt' );
		const laterAgent = clientMessage( 'agent-3', 'agent', 'Later answer' );

		const request = getRegenerateRequest(
			[
				firstUser,
				firstAgent,
				secondUser,
				secondAgent,
				laterUser,
				laterAgent,
			],
			'agent-2'
		);

		expect( request ).not.toBeNull();
		if ( ! request ) {
			return;
		}

		expect( request.baseHistory ).toEqual( [ firstUser, firstAgent ] );
		expect( request.prompt ).toBe( 'Visible prompt' );
		expect( request.userMessage.messageId ).not.toBe( 'user-2' );
		expect( request.userMessage.parts ).toEqual( secondUser.parts );

		if ( request.userMessage.parts[ 2 ].type === 'file' ) {
			request.userMessage.parts[ 2 ].file.uri = 'changed';
		}
		expect(
			secondUser.parts[ 2 ].type === 'file' &&
				secondUser.parts[ 2 ].file.uri
		).toBe( 'https://example.com/flower.png' );
	} );

	it( 'does not regenerate context-only user turns', () => {
		const clientMessages = [
			clientMessage( 'user-1', 'user', 'Hidden', {
				contentType: 'context',
			} ),
			clientMessage( 'agent-1', 'agent', 'Answer' ),
		];

		expect( canRegenerateAgentMessage( clientMessages, 'agent-1' ) ).toBe(
			false
		);
		expect( getRegenerateRequest( clientMessages, 'agent-1' ) ).toBeNull();
	} );

	it( 'finds the latest agent message that can be regenerated', () => {
		const clientMessages = [
			clientMessage( 'user-1', 'user', 'First prompt' ),
			clientMessage( 'agent-1', 'agent', 'First answer' ),
			clientMessage( 'user-2', 'user', 'Hidden', {
				contentType: 'context',
			} ),
			clientMessage( 'agent-2', 'agent', 'Context-only answer' ),
		];

		expect( getLatestRegeneratableAgentMessageId( clientMessages ) ).toBe(
			'agent-1'
		);
	} );
} );
