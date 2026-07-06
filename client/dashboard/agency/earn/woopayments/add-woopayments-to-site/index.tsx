import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import { useCallback, useEffect, useState } from 'react';
import { useAnalytics } from '../../../../app/analytics';
import AddWooPaymentsToSiteModal from './modal';

interface AddWooPaymentsToSiteProps {
	excludedSiteIds: number[];
}

export default function AddWooPaymentsToSite( { excludedSiteIds }: AddWooPaymentsToSiteProps ) {
	const { recordTracksEvent } = useAnalytics();

	const showModal = getQueryArg( window.location.href, 'add-woopayments-to-site' ) === 'true';
	const [ isOpen, setIsOpen ] = useState( false );

	const handleOpenModal = useCallback( () => {
		setIsOpen( true );
		recordTracksEvent( 'calypso_a4a_woopayments_add_site_button_click' );
	}, [ recordTracksEvent ] );

	useEffect( () => {
		if ( showModal ) {
			handleOpenModal();
			window.history.replaceState(
				null,
				'',
				removeQueryArgs(
					window.location.pathname + window.location.search,
					'add-woopayments-to-site'
				)
			);
		}
	}, [ handleOpenModal, showModal ] );

	return (
		<>
			<Button __next40pxDefaultSize variant="primary" onClick={ handleOpenModal }>
				{ __( 'Add WooPayments to site' ) }
			</Button>

			{ isOpen && (
				<AddWooPaymentsToSiteModal
					excludedSiteIds={ excludedSiteIds }
					onClose={ () => setIsOpen( false ) }
				/>
			) }
		</>
	);
}
