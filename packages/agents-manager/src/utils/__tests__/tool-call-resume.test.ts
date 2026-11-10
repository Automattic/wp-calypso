import { hasNewAgentReply } from '../tool-call-resume';
import type { Message } from '@automattic/agenttic-client';

const message = ( messageId: string, role: Message[ 'role' ], text: string ) =>
	( { messageId, role, kind: 'message', parts: [ { type: 'text', text } ] } ) as Message;

const question = message( 'm-question', 'user', 'Top 5?' );

describe( 'hasNewAgentReply', () => {
	it( 'finds a new agent message with text', () => {
		const history = [ question, message( 'm-reply', 'agent', 'Here are your top products.' ) ];

		expect( hasNewAgentReply( new Set( [ 'm-question' ] ), history ) ).toBe( true );
	} );

	it( 'finds a new agent message with only an interactive UI surface', () => {
		const surface = {
			messageId: 'm-reply',
			role: 'agent',
			kind: 'message',
			parts: [ { type: 'data', data: [], metadata: { mimeType: 'application/a2ui+json' } } ],
		} as Message;

		expect( hasNewAgentReply( new Set( [ 'm-question' ] ), [ question, surface ] ) ).toBe( true );
	} );

	it( 'ignores a new agent message whose text is blank', () => {
		const history = [ question, message( 'm-reply', 'agent', '  ' ) ];

		expect( hasNewAgentReply( new Set( [ 'm-question' ] ), history ) ).toBe( false );
	} );

	it( 'finds nothing in an unchanged history', () => {
		const history = [ question, message( 'm-answer', 'agent', 'An earlier answer.' ) ];

		expect( hasNewAgentReply( new Set( [ 'm-question', 'm-answer' ] ), history ) ).toBe( false );
	} );
} );
