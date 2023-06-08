import { Button } from '@automattic/components';
import { Icon, plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import SMSItemContent from './sms-item-content';
import type { StateMonitorSettingsSMS } from '../../sites-overview/types';
interface Props {
	toggleModal: () => void;
	allPhoneItems: Array< StateMonitorSettingsSMS >;
	verifiedPhoneNumber?: string;
}

export default function ConfigureSMSNotification( {
	toggleModal,
	allPhoneItems,
	verifiedPhoneNumber,
}: Props ) {
	const translate = useTranslate();

	const handleAddPhoneClick = () => {
		// Record event
		toggleModal();
	};

	return (
		<div className="configure-contact__card-container">
			{ allPhoneItems.map( ( item ) => (
				<SMSItemContent key={ item.phoneNumberFull } item={ item } />
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
