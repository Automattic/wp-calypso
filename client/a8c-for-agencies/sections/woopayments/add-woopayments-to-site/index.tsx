import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import AddWooPaymentsToSiteModal from './modal';

const AddWooPaymentsToSite = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const showModal = getQueryArg( window.location.href, 'add-woopayments-to-site' ) === 'true';
	const [ isOpen, setIsOpen ] = useState( false );

	const handleOpenModal = useCallback( () => {
		setIsOpen( true );
		dispatch( recordTracksEvent( 'calypso_a4a_woopayments_add_site_button_click' ) );
	}, [ dispatch ] );

	useEffect( () => {
		if ( showModal ) {
			handleOpenModal();
			page.redirect(
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
				{ translate( 'Add WooPayments to site' ) }
			</Button>

			{ isOpen && <AddWooPaymentsToSiteModal onClose={ () => setIsOpen( false ) } /> }
		</>
	);
};

export default AddWooPaymentsToSite;
