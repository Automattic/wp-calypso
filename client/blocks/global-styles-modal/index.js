import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Modal } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import image from './image.svg';

import './style.scss';

const GlobalStylesModal = ( {
	context,
	description,
	heading,
	isVisible,
	onClose,
	showTryOutButton = true,
	upgradeUrl,
} ) => {
	useEffect( () => {
		if ( isVisible ) {
			recordTracksEvent( 'calypso_global_styles_gating_modal_show', {
				context,
			} );
		}
	}, [ isVisible, context ] );

	const closeModal = () => {
		onClose();
		recordTracksEvent( 'calypso_global_styles_gating_modal_dismiss', {
			context,
		} );
	};

	if ( ! isVisible ) {
		return null;
	}

	return (
		<Modal
			className="global-styles-modal"
			onRequestClose={ closeModal }
			// set to false so that 1Password's autofill doesn't automatically close the modal
			shouldCloseOnClickOutside={ false }
		>
			<div className="global-styles-modal__text">
				<h1 className="global-styles-modal__heading">
					{ heading ?? __( 'A powerful new way to style your site' ) }
				</h1>
				<p className="global-styles-modal__description">
					{ description ??
						__( "Change all of your site's fonts, colors and more. Available on any paid plan." ) }
				</p>
				<div className="global-styles-modal__actions">
					{ showTryOutButton && (
						<Button variant="secondary" onClick={ closeModal }>
							{ __( 'Try it out' ) }
						</Button>
					) }
					<Button
						variant="primary"
						href={ upgradeUrl }
						target="_top"
						onClick={ () =>
							recordTracksEvent( 'calypso_global_styles_gating_modal_upgrade_click', {
								context,
							} )
						}
					>
						{ __( 'Upgrade plan' ) }
					</Button>
				</div>
			</div>
			<div className="global-styles-modal__image">
				<img src={ image } alt="" />
			</div>
		</Modal>
	);
};

export default GlobalStylesModal;
