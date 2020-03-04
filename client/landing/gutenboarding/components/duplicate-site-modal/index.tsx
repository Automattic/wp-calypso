/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { Button, Modal } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
import { recordTracksEvent } from '@automattic/calypso-analytics';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import './style.scss';

interface Props {
	onRequestClose: () => void;
}

const DuplicateSiteModal = ( { onRequestClose }: Props ) => {
	const { __: NO__ } = useI18n();

	const lastCreatedSite = useSelect( select => select( ONBOARD_STORE ).getLastCreatedSite() );

	const { resetOnboardStore } = useDispatch( ONBOARD_STORE );

	useEffect( () => {
		recordTracksEvent( 'calypso_duplicate_site_modal_start', {
			flow: 'gutenboarding',
		} );
	}, [] );

	const handleClose = () => {
		resetOnboardStore();
		onRequestClose();
	};

	return (
		<Modal
			className="duplicate-site-modal"
			isDismissible={ true }
			title={ NO__( 'You might have an existing site' ) }
			onRequestClose={ handleClose }
			focusOnMount={ false }
		>
			<p className="duplicate-site-modal__description">
				{ NO__( 'Found an existing site:' ) } { lastCreatedSite?.domain }
			</p>

			<Button className="duplicate-site-modal__cta" onClick={ handleClose } isPrimary isLarge>
				{ NO__( 'Create new site' ) }
			</Button>

			<a className="duplicate-site-modal__cta-link" href={ `/home/${ lastCreatedSite?.domain }` }>
				<Button className="duplicate-site-modal__cta" isPrimary isLarge>
					{ NO__( 'Edit existing site' ) }
				</Button>
			</a>
		</Modal>
	);
};

export default DuplicateSiteModal;
