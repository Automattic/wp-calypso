import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import AlertBanner from 'calypso/components/jetpack/alert-banner';
import ConfigureSMSNotification from '../../configure-sms-notification';

interface Props {
	enableSMSNotification: boolean;
	setEnableSMSNotification: ( isEnabled: boolean ) => void;
	toggleModal: () => void;
}

export default function SMSNotification( {
	enableSMSNotification,
	setEnableSMSNotification,
	toggleModal,
}: Props ) {
	const translate = useTranslate();

	const handleToggleClick = ( isEnabled: boolean ) => {
		// Record event here
		setEnableSMSNotification( isEnabled );
	};

	const allPhoneNumbers = [
		{
			number: '+1 1234567890',
			name: 'John Smith',
			isDefault: true,
			verified: true,
		},
		{
			number: '+1 9876543210',
			name: 'Sally Jones',
			isDefault: false,
			verified: false,
		},
	]; // TODO: Get all phone numbers from the API when it is ready

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
			{ enableSMSNotification && allPhoneNumbers.length === 0 && (
				<>
					<div className="margin-top-16">
						<AlertBanner type="warning">
							{ translate( 'You need at least one phone number' ) }
						</AlertBanner>
					</div>
					<ConfigureSMSNotification toggleModal={ toggleModal } allPhoneItems={ allPhoneNumbers } />
				</>
			) }
			{ enableSMSNotification && allPhoneNumbers.length > 0 && (
				<ConfigureSMSNotification toggleModal={ toggleModal } allPhoneItems={ allPhoneNumbers } />
			) }
		</>
	);
}
