import { Button } from '@automattic/components';
import { Icon, plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { StateMonitorSettingsSMS } from '../../sites-overview/types';
import SMSItemContent from './sms-item-content';

import './style.scss';

type AllowedMonitorContactActions = 'edit' | 'remove' | 'verify';

interface Props {
	toggleModal: ( item?: StateMonitorSettingsSMS, action?: AllowedMonitorContactActions ) => void;
	allPhoneItems: Array< StateMonitorSettingsSMS >;
}

export default function ConfigureSMSNotification( { toggleModal, allPhoneItems = [] }: Props ) {
	const translate = useTranslate();

	const handleAddPhoneNumberClick = () => {
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
				onClick={ handleAddPhoneNumberClick }
				aria-label={ translate( 'Add phone number' ) }
			>
				<Icon size={ 18 } icon={ plus } />
				{ translate( 'Add phone number' ) }
			</Button>
		</div>
	);
}
