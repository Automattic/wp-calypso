import { __ } from '@wordpress/i18n';
import { Message, MessageRole, MessageType, ZendeskMessage } from '../types';

// Format markdown to support images attachments that open in a new tab.
function prepareMarkdownImage( imgUrl: string, isPlaceholder: boolean ): string {
	return isPlaceholder ? `![Image](${ imgUrl })` : `[![Image](${ imgUrl })](${ imgUrl })`;
}

function convertUrlsToMarkdown( text: string ): string {
	const urlRegex = /\b((https?:\/\/)?(www\.)?[\w.-]+\.[a-z]{2,}(\.[a-z]{2,})*(\/[^\s]*)?)/gi;

	return text.replace( urlRegex, ( match ) => {
		let url = match;
		if ( ! /^https?:\/\//i.test( url ) ) {
			url = `https://${ url }`;
		}
		try {
			const validUrl = new URL( url );
			return `[${ match }](${ validUrl.href })`;
		} catch {
			return match;
		}
	} );
}

// Format markdown to support file attachments, returns a link to download the file.
function createDownloadableMarkdownLink( url: string, AttachmentTitle: string ): string {
	const fileName = url.split( '/' ).pop()?.split( '?' )[ 0 ];
	return `[${ AttachmentTitle } ${ fileName }](${ url })`;
}

function getContentMessage( message: ZendeskMessage ): string {
	let messageContent = '';
	switch ( message.type ) {
		case 'image':
		case 'image-placeholder':
			if ( message.mediaUrl ) {
				messageContent = prepareMarkdownImage(
					message.mediaUrl,
					message.type === 'image-placeholder' ? true : false
				);
			}
			break;
		case 'text':
			messageContent = convertUrlsToMarkdown( message.text );
			break;
		case 'file':
			if ( message.mediaUrl ) {
				messageContent = createDownloadableMarkdownLink(
					message.mediaUrl,
					message.altText || __( 'Attachment' )
				);
			}
			break;
		default:
			// We don't support it yet return generic message.
			messageContent = __( 'Message content not supported' );
	}
	return messageContent;
}

export const zendeskMessageConverter: ( message: ZendeskMessage ) => Message = ( message ) => {
	let type = message.type as MessageType;
	let feedbackUrl;

	if ( message?.source?.type === 'zd:surveys' && message?.actions?.length ) {
		type = 'conversation-feedback';
		feedbackUrl = message?.actions[ 0 ].uri;
	}

	return {
		...( feedbackUrl ? { meta: { feedbackUrl } } : undefined ),
		content: getContentMessage( message ),
		role: ( [ 'user', 'business' ].includes( message.role )
			? message.role
			: 'user' ) as MessageRole,
		type,
	};
};
