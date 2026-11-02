import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useRef, useState } from 'react';
import AddWooPaymentsToSiteModal from './modal';
import type { RecordTracksEvent } from '../types';

interface AddWooPaymentsToSiteProps {
	agencyId: number;
	excludedSiteIds: number[];
	recordTracksEvent: RecordTracksEvent;
	onSelectSite: ( siteId: number ) => void;
	shouldUseRouterLink?: boolean;
	/** Opens the modal once, as when a link asks for it. */
	autoOpen?: boolean;
}

export default function AddWooPaymentsToSite( {
	agencyId,
	excludedSiteIds,
	recordTracksEvent,
	onSelectSite,
	shouldUseRouterLink,
	autoOpen,
}: AddWooPaymentsToSiteProps ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const hasAutoOpened = useRef( false );

	const handleOpenModal = useCallback( () => {
		setIsOpen( true );
		recordTracksEvent( 'calypso_a4a_woopayments_add_site_button_click' );
	}, [ recordTracksEvent ] );

	useEffect( () => {
		if ( autoOpen && ! hasAutoOpened.current ) {
			hasAutoOpened.current = true;
			handleOpenModal();
		}
	}, [ autoOpen, handleOpenModal ] );

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
					onSelectSite={ onSelectSite }
					onClose={ () => setIsOpen( false ) }
					shouldUseRouterLink={ shouldUseRouterLink }
				/>
			) }
		</>
	);
}
