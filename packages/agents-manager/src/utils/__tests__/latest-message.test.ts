import { getLatestUserMessageIndex } from '../latest-message';
import type { UIMessage } from '@automattic/agenttic-client';

const createMessage = ( id: string, role: 'user' | 'agent', extra = {} ): UIMessage => ( {
	id,
	role,
	content: [ { type: 'text', text: id } ],
	timestamp: 0,
	archived: false,
	showIcon: false,
	...extra,
} );

describe( 'getLatestUserMessageIndex', () => {
	it( 'finds the latest message the user typed', () => {
		const messages = [ createMessage( 'a', 'user' ), createMessage( 'b', 'agent' ) ];

		expect( getLatestUserMessageIndex( messages ) ).toBe( 0 );
	} );

	it( 'skips a UI-only question such as /credits, which no turn answers', () => {
		const messages = [
			createMessage( 'real', 'user' ),
			createMessage( 'reply', 'agent' ),
			createMessage( 'credits-command-question-1', 'user', { isUiOnly: true } ),
			createMessage( 'credits-command-1', 'agent' ),
		];

		expect( getLatestUserMessageIndex( messages ) ).toBe( 0 );
	} );

	it( 'gives -1 when there is none', () => {
		expect( getLatestUserMessageIndex( [ createMessage( 'a', 'agent' ) ] ) ).toBe( -1 );
	} );
} );
