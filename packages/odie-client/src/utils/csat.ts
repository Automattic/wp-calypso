import type { Chat, Message } from '../types';
import type { ZendeskMessage } from '@automattic/zendesk-client';

export const isCSATMessage = ( message: Message ) =>
	message?.feedbackOptions?.length && message?.metadata?.type === 'csat';

export const hasFeedbackForm = ( message: Message ) => message?.type === 'form';

export const isAttachment = ( message: Message ) =>
	message?.type === 'image' || message?.type === 'image-placeholder';

export const isZendeskIntroMessage = ( message: Message | ZendeskMessage ) =>
	'source' in message && message.source?.type === 'zd:answerBot';

export const isZendeskChatStartedMessage = ( message: Message ) =>
	message?.internal_message_id === 'zendesk-chat-started';

/**
 * A business message is sent by a real Happiness Engineer only when it carries a non-empty
 * Zendesk agent id in its metadata. Automated/system messages (messaging triggers, CSAT, etc.)
 * have an empty or missing agent id, so the "Happiness Engineer" name override must not apply to
 * them — they keep their Zendesk-configured display name instead.
 */
export const isHappinessEngineerMessage = ( message: Message | ZendeskMessage ) =>
	message?.role === 'business' && !! message?.metadata?.[ '__zendesk_msg.agent.id' ];

export const hasCSATMessage = ( chat: Chat ) => {
	return chat?.messages.some( isCSATMessage );
};

export const hasSubmittedCSATRating = ( chat: Chat ) => {
	return chat?.messages.some( ( message ) => message?.metadata?.rated === true );
};
