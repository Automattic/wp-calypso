/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { Button, Modal } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
import { recordTracksEvent } from '@automattic/calypso-analytics';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { SITE_STORE } from '../../stores/site';
import './style.scss';

interface Props {
	onRequestClose: () => void;
}

const DuplicateSiteModal = ( { onRequestClose }: Props ) => {
	const { __: NO__ } = useI18n();

	const [ showDuplicateSiteModal, setShowDuplicateSiteModal ] = useState( false );

	const lastCreatedSite = useSelect( select => select( ONBOARD_STORE ).getLastCreatedSite() );
	const existingSite = useSelect( select => {
		return select( SITE_STORE ).getExistingSite( lastCreatedSite?.domain );
	} );

	useEffect( () => {
		recordTracksEvent( 'calypso_duplicate_site_modal_start', {
			flow: 'gutenboarding',
		} );
	}, [] );

	useEffect( () => {
		if ( existingSite ) {
			setShowDuplicateSiteModal( true );
		}
	}, [ lastCreatedSite, existingSite ] );

	if ( showDuplicateSiteModal ) {
		return (
			<Modal
				className="duplicate-site-modal"
				isDismissible={ true }
				title={ NO__( 'You might have an existing site' ) }
				onRequestClose={ onRequestClose }
				focusOnMount={ false }
			>
				<p className="duplicate-site-modal__description">
					{ NO__( 'Found an existing site:' ) } { existingSite?.name }
				</p>

				<Button className="duplicate-site-modal__cta" onClick={ onRequestClose } isPrimary isLarge>
					{ NO__( 'Create new site' ) }
				</Button>

				<a className="duplicate-site-modal__cta-link" href={ `/home/${ lastCreatedSite?.domain }` }>
					<Button className="duplicate-site-modal__cta" isPrimary isLarge>
						{ NO__( 'Edit existing site' ) }
					</Button>
				</a>
			</Modal>
		);
	}
	return null;
};

export default DuplicateSiteModal;
