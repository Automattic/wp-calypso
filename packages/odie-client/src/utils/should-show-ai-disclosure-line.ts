import { interactionHasZendeskEvent } from './support-interaction-utils';
import type { Chat, SupportInteraction } from '../types';

/**
 * Whether to show the AI disclosure line: not while the chat is pending, not while a chat that goes
 * straight to a person is starting, and not once a person is in the chat. The provider says who is
 * answering. During a transfer, the Zendesk event lands on the interaction before the provider
 * switches, so it counts as a person having joined.
 */
export function shouldShowAiDisclosureLine( {
	chat,
	interaction,
	isChatPending,
	isPendingDirectChat = false,
}: {
	chat: Chat;
	interaction?: SupportInteraction;
	isChatPending: boolean;
	isPendingDirectChat?: boolean;
} ): boolean {
	if ( isChatPending || isPendingDirectChat ) {
		return false;
	}
	if ( chat?.provider?.startsWith( 'zendesk' ) ) {
		return false;
	}
	return ! ( chat?.status === 'transfer' && interactionHasZendeskEvent( interaction ) );
}
