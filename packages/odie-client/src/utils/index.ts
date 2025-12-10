export { getTimestamp } from './get-timestamp';
export { zendeskMessageConverter } from '@automattic/zendesk-client';
export { isOdieAllowedBot } from './is-odie-allowed-bot';
export { generateUUID } from './generate-uuid';
export {
	interactionHasZendeskEvent,
	interactionHasEnded,
	getConversationIdFromInteraction,
	getOdieIdFromInteraction,
} from './support-interaction-utils';
export { isCSATMessage, hasCSATMessage, hasSubmittedCSATRating } from './csat';
import { ODIE_DEFAULT_BOT_SLUG_LEGACY } from '../constants';
import type { Chat, Message, SupportInteraction } from '../types';

export const getIsRequestingHumanSupport = ( message: Message ) => {
	return message.context?.flags?.forward_to_human_support ?? false;
};

export const getIsLastBotMessage = ( chat: Chat, message: Message ) => {
	return (
		chat?.messages?.length > 0 &&
		chat?.messages[ chat?.messages?.length - 1 ].role === 'bot' &&
		chat?.messages[ chat?.messages?.length - 1 ].message_id === message.message_id
	);
};

export function getBotSlug(
	supportInteraction: SupportInteraction | undefined,
	newInteractionsBotSlug: string
): string {
	if ( supportInteraction ) {
		// Legacy support interactions have their botSlug set to `''`. We need to use the legacy bot slug for them.
		return supportInteraction.bot_slug || ODIE_DEFAULT_BOT_SLUG_LEGACY;
	}

	// When the interaction is undefined, it means we're sending the first message to Odie, which is done before the interaction is created.
	// In this case, we use the new interactions bot slug.
	return newInteractionsBotSlug;
}
