import { Message, MessageRole, MessageType, ZendeskMessage } from '../types/';

function prepareMarkdownImage( imgUrl: string ): string {
	return `![Image](${ imgUrl })`;
}

function convertUrlsToMarkdown( text: string ): string {
	const urlRegex =
		/\b(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s<>[\](){}'"]*)?/gi;

	return text.replace( urlRegex, ( url ) => {
		// Clean up any trailing punctuation
		const cleanUrl = url.replace( /[.,!?]+$/, '' );
		const fullUrl = cleanUrl.startsWith( 'http' ) ? cleanUrl : `https://${ cleanUrl }`;
		return `[${ cleanUrl }](${ fullUrl })`;
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
