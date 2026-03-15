import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import './attachment-message.scss';

export type AttachmentMessageType = 'file' | 'image' | 'image-placeholder';

export interface AttachmentMessageProps {
	/** URL of the attached file or image. */
	mediaUrl: string;
	/** Zendesk message type: file, image, or image-placeholder. */
	type: AttachmentMessageType;
	/** Optional alt text or file name. */
	altText?: string;
	/** Optional CSS class name. */
	className?: string;
}

const isImageType = ( type: string ) => type === 'image' || type === 'image-placeholder';

export const AttachmentMessage = ( {
	mediaUrl,
	type,
	altText,
	className,
}: AttachmentMessageProps ) => {
	const fileName = altText || mediaUrl.split( '/' ).pop()?.split( '?' )[ 0 ] || 'file';

	if ( isImageType( type ) ) {
		return (
			<div className={ clsx( 'zendesk-attachment-message', className ) }>
				<a
					href={ mediaUrl }
					target="_blank"
					rel="noopener noreferrer"
					className="zendesk-attachment-message__link"
				>
					<img
						src={ mediaUrl }
						alt={ altText || __( 'Attached image', '__i18n_text_domain__' ) }
						className="zendesk-attachment-message__image"
					/>
				</a>
			</div>
		);
	}

	return (
		<div className={ clsx( 'zendesk-attachment-message', className ) }>
			<a
				href={ mediaUrl }
				target="_blank"
				rel="noopener noreferrer"
				className="zendesk-attachment-message__file-link"
			>
				<span className="zendesk-attachment-message__file-icon" aria-hidden>
					📎
				</span>
				{ fileName }
			</a>
		</div>
	);
};
