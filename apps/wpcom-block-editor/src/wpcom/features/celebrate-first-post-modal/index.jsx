import { Button, Modal } from '@wordpress/components';
import { select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import tracksRecordEvent from '../tracking/track-record-event';
import { fireConfetti } from './confetti';

import './style.scss';

export function CelebrateFirstPostModal( { onClose } ) {
	const siteSlug = window.location.hostname;
	const postUrl = select( 'core/editor' ).getPermalink();

	useEffect( () => {
		fireConfetti();
		tracksRecordEvent( 'calypso_newsletter_first_publish_celebration_shown' );
	}, [] );

	const handleCtaClick = ( cta ) => {
		tracksRecordEvent( 'calypso_newsletter_first_publish_celebration_cta_click', { cta } );
	};

	return (
		<Modal
			onRequestClose={ () => {
				handleCtaClick( 'dismiss' );
				onClose();
			} }
			className="celebrate-first-post-modal"
			shouldCloseOnClickOutside={ false }
		>
			<h1 className="celebrate-first-post-modal__heading">
				{ __( 'Your first post is published!' ) }
			</h1>
			<p className="celebrate-first-post-modal__body">
				{ __( 'Your subscribers will receive it shortly. Keep the momentum going.' ) }
			</p>
			<div className="celebrate-first-post-modal__actions">
				<Button
					variant="primary"
					href={ `https://wordpress.com/post/${ siteSlug }` }
					target="_top"
					onClick={ () => handleCtaClick( 'next_post' ) }
				>
					{ __( 'Write your next post' ) }
				</Button>
				{ postUrl && (
					<Button
						variant="secondary"
						href={ postUrl }
						target="_blank"
						rel="noopener noreferrer"
						onClick={ () => handleCtaClick( 'view_post' ) }
					>
						{ __( 'View your post' ) }
					</Button>
				) }
			</div>
		</Modal>
	);
}
