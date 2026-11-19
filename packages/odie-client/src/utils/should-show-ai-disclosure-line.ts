import { interactionHasZendeskEvent } from './support-interaction-utils';
import type { Chat, SupportInteraction } from '../types';

/**
 * Whether to show the AI disclosure line: not while the chat is pending, and not once a person is
 * in the chat. The provider says who is answering. During a transfer, the Zendesk event lands on the
 * interaction before the provider switches, so it counts as a person having joined.
 */
export function shouldShowAiDisclosureLine( {
	chat,
	interaction,
	isChatPending,
}: {
	chat: Chat;
	interaction?: SupportInteraction;
	isChatPending: boolean;
} ): boolean {
	if ( isChatPending ) {
		return false;
	}
	if ( chat?.provider?.startsWith( 'zendesk' ) ) {
		return false;
	}
	return ! ( chat?.status === 'transfer' && interactionHasZendeskEvent( interaction ) );
}
