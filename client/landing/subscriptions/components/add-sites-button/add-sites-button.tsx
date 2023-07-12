import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import './styles.scss';
import { AddSitesModal } from 'calypso/landing/subscriptions/components/add-sites-modal';

const AddSitesButton = () => {
	const translate = useTranslate();
	const [ isAddSitesModalVisible, setIsAddSitesModalVisible ] = useState( false );

	return (
		<>
			<Button
				primary
				className="subscriptions-add-sites-button"
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
