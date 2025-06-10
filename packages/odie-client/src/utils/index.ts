export { getTimestamp } from './get-timestamp';
export { zendeskMessageConverter } from './zendesk-message-converter';
export { isOdieAllowedBot } from './is-odie-allowed-bot';
export { generateUUID } from './generate-uuid';
export {
	setHelpCenterZendeskConversationStarted,
	getHelpCenterZendeskConversationStarted,
	getHelpCenterZendeskConversationStartedElapsedTime,
} from './storage-utils';
export {
	interactionHasZendeskEvent,
	interactionHasEnded,
	getConversationIdFromInteraction,
	getOdieIdFromInteraction,
} from './support-interaction-utils';
export { userProvidedEnoughInformation } from './user-provided-enough-information';
import type { Message } from '../types';

export const getIsRequestingHumanSupport = ( message: Message ) => {
	return message.context?.flags?.forward_to_human_support ?? false;
};
