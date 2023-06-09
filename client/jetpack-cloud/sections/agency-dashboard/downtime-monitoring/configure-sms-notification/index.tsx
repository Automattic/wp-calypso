import { Button } from '@automattic/components';
import { Icon, plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import type { StateMonitorSettingsSMS } from '../../sites-overview/types';

interface Props {
	toggleModal: () => void;
	allPhoneItems: Array< StateMonitorSettingsSMS >;
}

export default function ConfigureSMSNotification( { toggleModal, allPhoneItems }: Props ) {
	const translate = useTranslate();

	const handleAddPhoneClick = () => {
		// Record event
		toggleModal();
	};

	return (
		<div className="configure-contact__card-container">
			{ allPhoneItems.map( ( item ) => (
				// TODO: Replace with the correct component
				<li key={ item.phoneNumberFull }>{ item.phoneNumberFull }</li>
			) ) }
			<Button
				compact
				className="configure-contact__button"
				onClick={ handleAddPhoneClick }
				aria-label={ translate( 'Add phone number' ) }
			>
				<Icon size={ 18 } icon={ plus } />
				{ translate( 'Add phone number' ) }
			</Button>
		</div>
	);
}
