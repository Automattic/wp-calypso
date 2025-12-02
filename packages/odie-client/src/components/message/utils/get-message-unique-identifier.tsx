import { Message } from '../../../types';

export const getMessageUniqueIdentifier = ( message: Message, fallback?: string ) => {
	return (
		message.metadata?.temporary_id ??
		message.message_id ??
		message.internal_message_id ??
		message.metadata?.local_timestamp ??
		fallback
	);
};
