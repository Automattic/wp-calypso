import { Message, MessageRole, MessageType, ZendeskMessage } from '../types/';

function prepareMarkdownImage( imgUrl: string ): string {
	return `![Image](${ imgUrl })`;
}

function convertUrlsToMarkdown( text: string ): string {
	const urlRegex = /\b((https?:\/\/)?(www\.)?[\w-]+\.[\w.-]+\b)/g;

	return text.replace( urlRegex, ( url ) => {
		const fullUrl = url.startsWith( 'http' ) ? url : `https://${ url }`;
		return `[${ url }](${ fullUrl })`;
	} );
}

export const zendeskMessageConverter: ( message: ZendeskMessage ) => Message = ( message ) => {
	const messageContent =
		message.type === 'image' && message.mediaUrl
			? prepareMarkdownImage( message.mediaUrl )
			: convertUrlsToMarkdown( message.text );

	return {
		content: messageContent,
		role: ( [ 'user', 'business' ].includes( message.role )
			? message.role
			: 'user' ) as MessageRole,
		type: message.type as MessageType,
	};
};
