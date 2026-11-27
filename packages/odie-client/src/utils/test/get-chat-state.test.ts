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

const notPending = { isPendingDirectChat: false, isWaitingForFirstMessage: false };
const pending = { isPendingDirectChat: true, isWaitingForFirstMessage: false };
const waitingForFirstMessage = { isPendingDirectChat: true, isWaitingForFirstMessage: true };

describe( 'getChatState', () => {
	it.each( [
		[ 'ai', chatWith( {} ), notPending ],
		[ 'not_started', chatWith( {} ), waitingForFirstMessage ],
		// The first message was sent and the conversation is being created.
		[ 'connecting', chatWith( { status: 'transfer' } ), waitingForFirstMessage ],
		[ 'connecting', chatWith( {} ), pending ],
		[ 'connecting', chatWith( { status: 'transfer' } ), notPending ],
		[
			'waiting_for_agent',
			chatWith( { provider: 'zendesk', messages: [ automatedMessage ] } ),
			notPending,
		],
		[
			'with_agent',
			chatWith( { provider: 'zendesk', messages: [ automatedMessage, agentMessage ] } ),
			notPending,
		],
	] )( 'is %s', ( expected, chat, pendingDirectChat ) => {
		expect( getChatState( chat, pendingDirectChat ) ).toBe( expected );
	} );
} );
