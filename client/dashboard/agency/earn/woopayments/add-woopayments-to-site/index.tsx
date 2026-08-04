import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import { useCallback, useEffect, useState } from 'react';
import AddWooPaymentsToSiteModal from './modal';
import type { RecordTracksEvent } from '../types';

interface AddWooPaymentsToSiteProps {
	agencyId: number;
	excludedSiteIds: number[];
	recordTracksEvent: RecordTracksEvent;
	navigate: ( url: string ) => void;
}

export default function AddWooPaymentsToSite( {
	agencyId,
	excludedSiteIds,
	recordTracksEvent,
	navigate,
}: AddWooPaymentsToSiteProps ) {
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
					agencyId={ agencyId }
					excludedSiteIds={ excludedSiteIds }
					recordTracksEvent={ recordTracksEvent }
					navigate={ navigate }
					onClose={ () => setIsOpen( false ) }
				/>
			) }
		</>
	);
}
