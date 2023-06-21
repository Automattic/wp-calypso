import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import ContactList from '../../contact-list';
import type { StateMonitorSettingsSMS } from '../../../sites-overview/types';

interface Props {
	recordEvent: ( action: string, params?: object ) => void;
	enableSMSNotification: boolean;
	setEnableSMSNotification: ( isEnabled: boolean ) => void;
	toggleModal: () => void;
	allPhoneItems: Array< StateMonitorSettingsSMS >;
	verifiedItem?: { [ key: string ]: string };
}

export default function SMSNotification( {
	recordEvent,
	enableSMSNotification,
	setEnableSMSNotification,
	toggleModal,
	allPhoneItems,
	verifiedItem,
}: Props ) {
	const translate = useTranslate();

	const handleToggleClick = ( isEnabled: boolean ) => {
		recordEvent( isEnabled ? 'sms_notification_enable' : 'sms_notification_disable' );
		setEnableSMSNotification( isEnabled );
	};

	return (
		<>
			<div className="notification-settings__toggle-container">
				<div className="notification-settings__toggle">
					<ToggleControl onChange={ handleToggleClick } checked={ enableSMSNotification } />
				</div>
				<div className="notification-settings__toggle-content">
					<div className="notification-settings__content-heading-with-beta">
						<div className="notification-settings__content-heading">{ translate( 'Mobile' ) }</div>
						<div className="notification-settings__beta-tag">{ translate( 'BETA' ) }</div>
					</div>
					<div className="notification-settings__content-sub-heading">
						{ translate( 'Set up text messages to send to one or more people' ) }
					</div>
				</div>
			</div>
			{ enableSMSNotification && (
				<ContactList
					type="sms"
					onAction={ toggleModal }
					items={ allPhoneItems }
					recordEvent={ recordEvent }
					verifiedItemKey={ verifiedItem?.phone }
				/>
			) }
		</>
	);
}
