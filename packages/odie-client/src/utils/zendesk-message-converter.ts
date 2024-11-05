import { __ } from '@wordpress/i18n';
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
	let messageContent = '';
	if ( message.type === 'image' && message.mediaUrl ) {
		messageContent = prepareMarkdownImage( message.mediaUrl );
	} else if ( message.type === 'text' ) {
		messageContent = convertUrlsToMarkdown( message.text );
	} else if ( message.type === 'file' && message.mediaUrl ) {
		// We don't support it yet return generic message.
		messageContent = __( 'Message content not supported' );
	}

	return {
		content: messageContent,
		role: ( [ 'user', 'business' ].includes( message.role )
			? message.role
			: 'user' ) as MessageRole,
		type: message.type as MessageType,
	};
};
