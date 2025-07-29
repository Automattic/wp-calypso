import { __ } from '@wordpress/i18n';
import DOMPurify from 'dompurify';
import type { Context, Message, MessageRole, MessageType, ZendeskMessage } from '../types';
import type { ReactNode } from 'react';

// Format markdown to support images attachments that open in a new tab.
function prepareMarkdownImage( imgUrl: string, isPlaceholder: boolean ): string {
	return isPlaceholder ? `![Image](${ imgUrl })` : `[![Image](${ imgUrl })](${ imgUrl })`;
}

function convertUrlsToMarkdown( text: string ): string {
	const urlRegex = /\b((https?:\/\/)?(www\.)?[\w.-]+\.[a-z]{2,}(\.[a-z]{2,})*(\/[^\s]*)?)/gi;

	return text.replace( urlRegex, ( match ) => {
		let url = match;

		// Remove trailing punctuation if it's only a sentence-ending character
		url = url.replace( /[.,!?;:]+$/g, '' );

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

function getContentMessage( message: ZendeskMessage ): Message[ 'content' ] {
	let messageContent: ReactNode = '';
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
			if ( message.htmlText ) {
				messageContent = (
					// eslint-disable-next-line react/no-danger
					<span dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize( message.htmlText ) } } />
				);
			} else {
				messageContent = convertUrlsToMarkdown( message.text );
			}
			break;
		case 'file':
			if ( message.mediaUrl ) {
				messageContent = createDownloadableMarkdownLink(
					message.mediaUrl,
					message.altText || __( 'Attachment', __i18n_text_domain__ )
				);
			}
			break;
		default:
			// We don't support it yet return generic message.
			messageContent = __( 'Message content not supported', __i18n_text_domain__ );
	}

	if ( message?.metadata?.type === 'csat' && message.actions?.length ) {
		messageContent = __(
			'Please help us improve. How would you rate your support experience?',
			__i18n_text_domain__
		);
	}

	return messageContent;
}

export const zendeskMessageConverter: ( message: ZendeskMessage ) => Message = ( message ) => {
	let type = message.type as MessageType;
	let context: Context = { site_id: null };
	let role = (
		[ 'user', 'business' ].includes( message.role ) ? message.role : 'user'
	) as MessageRole;

	if ( message?.source?.type === 'zd:answerBot' ) {
		type = 'message';
		role = 'bot';
		context = {
			...context,
			flags: {
				hide_disclaimer_content: true,
				show_contact_support_msg: true,
				show_ai_avatar: false,
			},
		};
	}

	return {
		content: getContentMessage( message ),
		context,
		role,
		type,
		quotedMessageId: message.id,
		metadata: message.metadata,
		feedbackOptions: message.actions,
	};
};
