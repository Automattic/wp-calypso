import { Chat, Message } from '../types';

export const isCSATMessage = ( message: Message ) =>
	message?.feedbackOptions?.length && message?.metadata?.type === 'csat';

export const hasCSATMessage = ( chat: Chat ) => {
	return chat?.messages.some( isCSATMessage );
};

export const hasSubmittedCSATRating = ( chat: Chat ) => {
	return chat?.messages.some( ( message ) => message?.metadata?.rated === true );
};
