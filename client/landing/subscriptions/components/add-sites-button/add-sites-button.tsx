import { isEnabled } from '@automattic/calypso-config';
import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { AddSitesModal } from 'calypso/landing/subscriptions/components/add-sites-modal';
import './styles.scss';

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
				<Gridicon className="subscriptions-add-sites__button-icon" icon="plus" size={ 24 } />
				<span className="subscriptions-add-sites__button-text">{ translate( 'Add a site' ) }</span>
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
