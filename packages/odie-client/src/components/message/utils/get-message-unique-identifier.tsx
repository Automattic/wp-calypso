import { Message } from '../../../types';

export const getMessageUniqueIdentifier = ( message: Message ) => {
	return message.metadata?.temporary_id || message.message_id || message.internal_message_id;
};
