import { Message, MessageRole, ZendeskMessage } from '../types/';

export const zendeskMessageConverter: ( message: ZendeskMessage ) => Message = ( message ) => {
	return {
		content: message.text as string,
		role: ( [ 'user', 'business' ].includes( message.role )
			? message.role
			: 'user' ) as MessageRole,
		type: 'message',
	};
};
