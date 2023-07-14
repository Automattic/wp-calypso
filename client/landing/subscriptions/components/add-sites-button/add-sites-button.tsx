import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import './styles.scss';
import { AddSitesModal } from 'calypso/landing/subscriptions/components/add-sites-modal';

const AddSitesButton = () => {
	const translate = useTranslate();
	const [ isAddSitesModalVisible, setIsAddSitesModalVisible ] = useState( false );

	if ( ! isEnabled( 'subscription-management-add-sites-modal' ) ) {
		return null;
	}

	return (
		<>
			<Button
				primary
				className="subscriptions-add-sites__button"
				onClick={ () => setIsAddSitesModalVisible( true ) }
			>
				{ translate( 'Add sites' ) }
			</Button>
			<AddSitesModal
				showModal={ isAddSitesModalVisible }
				onClose={ () => setIsAddSitesModalVisible( false ) }
				onAddFinished={ () => setIsAddSitesModalVisible( false ) }
			/>
		</>
	);
};

export default AddSitesButton;
