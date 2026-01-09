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

export const hasCSATMessage = ( chat: Chat ) => {
	return chat?.messages.some( isCSATMessage );
};

export const hasSubmittedCSATRating = ( chat: Chat ) => {
	return chat?.messages.some( ( message ) => message?.metadata?.rated === true );
};
