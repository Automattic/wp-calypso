import { Message, MessageRole, ZendeskMessage } from '../types/';

const prepareMarkdownImage = ( imgUrl: string ) => {
	return `![Image](${ imgUrl })`;
};

export const zendeskMessageConverter: ( message: ZendeskMessage ) => Message = ( message ) => {
	const messageContent =
		message.type === 'image' && message.mediaUrl
			? prepareMarkdownImage( message.mediaUrl )
			: message.text;

	return {
		content: messageContent,
		role: ( [ 'user', 'business' ].includes( message.role )
			? message.role
			: 'user' ) as MessageRole,
		type: 'message',
	};
};
