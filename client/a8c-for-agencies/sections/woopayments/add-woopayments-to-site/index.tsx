import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import AddWooPaymentsToSiteModal from './modal';

const AddWooPaymentsToSite = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ isOpen, setIsOpen ] = useState( false );

	const handleOpenModal = () => {
		setIsOpen( true );
		dispatch( recordTracksEvent( 'calypso_a4a_woopayments_add_site_button_click' ) );
	};

	return (
		<>
			<Button variant="primary" onClick={ handleOpenModal }>
				{ translate( 'Add WooPayments to site' ) }
			</Button>

			{ isOpen && <AddWooPaymentsToSiteModal onClose={ () => setIsOpen( false ) } /> }
		</>
	);
};

export default AddWooPaymentsToSite;
