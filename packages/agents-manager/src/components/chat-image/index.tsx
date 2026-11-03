import { useRefEffect } from '@wordpress/compose';
import { createPortal, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, close } from '@wordpress/icons';
import clsx from 'clsx';
import { useIsInsideLink } from '../../contexts/inside-link-context';
import type { ImgHTMLAttributes, KeyboardEvent } from 'react';
import './style.scss';

interface ChatImageLightboxProps {
	src: string;
	alt: string;
	onClose: () => void;
}

/**
 * The full-size image in a modal `<dialog>`: the top layer shows it above the chat on every
 * host, and it needs no `wp-components` styles, which Reader Chat's blog pages may not load.
 */
function ChatImageLightbox( { src, alt, onClose }: ChatImageLightboxProps ) {
	const showModalRef = useRefEffect< HTMLDialogElement >( ( dialog ) => dialog.showModal(), [] );
	const [ isTall, setIsTall ] = useState( false );

	// The chat closes on any Escape left unprevented, so this closes only the lightbox.
	const handleKeyDown = ( event: KeyboardEvent< HTMLDialogElement > ) => {
		if ( event.key === 'Escape' ) {
			event.preventDefault();
			event.currentTarget.close();
		}
	};

	// Any click closes it.
	return createPortal(
		// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
		<dialog
			ref={ showModalRef }
			className={ clsx( 'agents-manager-chat-image__lightbox', {
				'agents-manager-chat-image__lightbox--tall': isTall,
			} ) }
			aria-label={ alt || __( 'Image', __i18n_text_domain__ ) }
			onClose={ onClose }
			onClick={ ( event ) => event.currentTarget.close() }
			onKeyDown={ handleKeyDown }
		>
			<img
				src={ src }
				alt={ alt }
				onLoad={ ( event ) =>
					setIsTall( event.currentTarget.naturalHeight > event.currentTarget.naturalWidth )
				}
			/>
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

	const image = <img src={ src } alt={ alt } />;

	if ( isInsideLink ) {
		return image;
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
				{ image }
			</button>
			{ isLightboxOpen && (
				<ChatImageLightbox src={ src } alt={ alt } onClose={ () => setIsLightboxOpen( false ) } />
			) }
		</>
	);
}
