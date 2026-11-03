import { useRefEffect } from '@wordpress/compose';
import { createPortal, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, close } from '@wordpress/icons';
import { useIsInsideLink } from '../../contexts/inside-link-context';
import type { ImgHTMLAttributes, KeyboardEvent } from 'react';
import './style.scss';

interface ChatImageLightboxProps {
	src: string;
	alt: string;
	onClose: () => void;
}

/**
 * The full-size image in a modal `<dialog>`. The top layer puts it above the chat on every
 * host without a z-index, and it needs no `wp-components` styles, which blog pages running
 * Reader Chat may not load.
 */
function ChatImageLightbox( { src, alt, onClose }: ChatImageLightboxProps ) {
	const showModalRef = useRefEffect< HTMLDialogElement >( ( dialog ) => dialog.showModal(), [] );

	// The chat closes on any Escape left unprevented, so this closes only the lightbox.
	const handleKeyDown = ( event: KeyboardEvent< HTMLDialogElement > ) => {
		if ( event.key === 'Escape' ) {
			event.preventDefault();
			event.currentTarget.close();
		}
	};

	// Any click closes it: on the backdrop, the image or the close button. React still bubbles
	// the portal's events to the floating chat, and `data-slot="chat-dialog"` keeps it from
	// starting a drag here.
	return createPortal(
		// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
		<dialog
			ref={ showModalRef }
			className="agents-manager-chat-image__lightbox"
			data-slot="chat-dialog"
			aria-label={ alt || __( 'Image', __i18n_text_domain__ ) }
			onClose={ onClose }
			onClick={ ( event ) => event.currentTarget.close() }
			onKeyDown={ handleKeyDown }
		>
			<img src={ src } alt={ alt } />
			<button
				type="button"
				className="agents-manager-chat-image__close"
				aria-label={ __( 'Close', __i18n_text_domain__ ) }
			>
				<Icon icon={ close } />
			</button>
		</dialog>,
		document.body
	);
}

/**
 * A markdown image in a chat message, opening full size on click. Inside a link it stays a
 * plain image, so the click follows the link.
 */
export function ChatImage( { src, alt = '' }: ImgHTMLAttributes< HTMLImageElement > ) {
	const [ isLightboxOpen, setIsLightboxOpen ] = useState( false );
	const isInsideLink = useIsInsideLink();

	if ( ! src ) {
		return null;
	}

	if ( isInsideLink ) {
		return <img src={ src } alt={ alt } />;
	}

	return (
		<>
			<button
				type="button"
				className="agents-manager-chat-image"
				title={ __( 'View full size', __i18n_text_domain__ ) }
				aria-haspopup="dialog"
				onClick={ () => setIsLightboxOpen( true ) }
			>
				<img src={ src } alt={ alt } />
			</button>
			{ isLightboxOpen && (
				<ChatImageLightbox src={ src } alt={ alt } onClose={ () => setIsLightboxOpen( false ) } />
			) }
		</>
	);
}
