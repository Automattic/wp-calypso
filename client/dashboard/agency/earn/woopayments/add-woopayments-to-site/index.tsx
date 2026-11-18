import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApprovalGate } from '../../../approval-gate';
import AddWooPaymentsToSiteModal from './modal';
import type { RecordTracksEvent } from '../types';

interface AddWooPaymentsToSiteProps {
	agencyId: number;
	excludedSiteIds: number[];
	recordTracksEvent: RecordTracksEvent;
	onSelectSite: ( siteId: number ) => void;
	shouldUseRouterLink?: boolean;
	/** Shows the approval gate in place of the site picker. */
	isApprovalGated?: boolean;
	/** Opens the modal, as when a link asks for it. Set it back to false in `onAutoOpen`. */
	autoOpen?: boolean;
	onAutoOpen?: () => void;
}

export default function AddWooPaymentsToSite( {
	agencyId,
	excludedSiteIds,
	recordTracksEvent,
	onSelectSite,
	shouldUseRouterLink,
	isApprovalGated,
	autoOpen,
	onAutoOpen,
}: AddWooPaymentsToSiteProps ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ isGateOpen, setIsGateOpen ] = useState( false );
	const hasAutoOpened = useRef( false );

	const handleOpenModal = useCallback( () => {
		if ( isApprovalGated ) {
			setIsGateOpen( true );
			return;
		}
		setIsOpen( true );
		recordTracksEvent( 'calypso_a4a_woopayments_add_site_button_click' );
	}, [ isApprovalGated, recordTracksEvent ] );

	useEffect( () => {
		if ( ! autoOpen ) {
			hasAutoOpened.current = false;
			return;
		}
		if ( ! hasAutoOpened.current ) {
			hasAutoOpened.current = true;
			handleOpenModal();
			onAutoOpen?.();
		}
	}, [ autoOpen, onAutoOpen, handleOpenModal ] );

	return (
		<>
			<Button __next40pxDefaultSize variant="primary" onClick={ handleOpenModal }>
				{ __( 'Add WooPayments to site' ) }
			</Button>

			{ isGateOpen && <ApprovalGate kind="woopayments" onClose={ () => setIsGateOpen( false ) } /> }
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
