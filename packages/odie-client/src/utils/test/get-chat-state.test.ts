import { vi } from 'vitest';
import { getChatState } from '../get-chat-state';
import type { Chat, Message } from '../../types';

vi.mock( '@automattic/zendesk-client', () => ( {} ) );

const agentMessage = {
	role: 'business',
	content: 'Hi, I can help',
	metadata: { '__zendesk_msg.agent.id': '4242' },
} as unknown as Message;
// A trigger or the move to email: from the business, but not from an agent.
const automatedMessage = {
	role: 'business',
	content: 'We will reply by email',
	metadata: { '__zendesk_msg.agent.id': '' },
} as unknown as Message;

const chatWith = ( fields: Partial< Chat > ): Chat =>
	( { provider: 'odie', status: 'loaded', messages: [], ...fields } ) as Chat;

describe( 'getChatState', () => {
	it.each( [
		[ 'ai', chatWith( {} ), false ],
		[ 'connecting', chatWith( {} ), true ],
		[ 'connecting', chatWith( { status: 'transfer' } ), false ],
		[
			'waiting_for_agent',
			chatWith( { provider: 'zendesk', messages: [ automatedMessage ] } ),
			false,
		],
		[
			'with_agent',
			chatWith( { provider: 'zendesk', messages: [ automatedMessage, agentMessage ] } ),
			false,
		],
	] )( 'is %s', ( expected, chat, isPendingDirectChat ) => {
		expect( getChatState( chat, isPendingDirectChat ) ).toBe( expected );
	} );
} );
