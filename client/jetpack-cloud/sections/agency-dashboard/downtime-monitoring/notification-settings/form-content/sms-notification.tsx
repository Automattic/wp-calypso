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
			name: 'John Jones',
			countryCode: '+1',
			phoneNumber: '8657711717',
			phoneNumberFull: '+1 8657711717',
			verified: true,
		},
		{
			name: 'Sarah Jones',
			countryCode: '+1',
			phoneNumber: '86573211111',
			phoneNumberFull: '+1 8653211111',
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
			{ enableSMSNotification && (
				<>
					{ allPhoneNumbers.length === 0 && (
						<div className="margin-top-16">
							<AlertBanner type="warning">
								{ translate( 'You need at least one phone number' ) }
							</AlertBanner>
						</div>
					) }
					<ConfigureSMSNotification toggleModal={ toggleModal } allPhoneItems={ allPhoneNumbers } />
				</>
			) }
		</>
	);
}
