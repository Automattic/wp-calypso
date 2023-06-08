import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import AlertBanner from 'calypso/components/jetpack/alert-banner';

interface Props {
	enableSMSNotification: boolean;
	setEnableSMSNotification: ( isEnabled: boolean ) => void;
}

export default function SMSNotification( {
	enableSMSNotification,
	setEnableSMSNotification,
}: Props ) {
	const translate = useTranslate();

	const handleToggleClick = ( isEnabled: boolean ) => {
		// Record event here
		setEnableSMSNotification( isEnabled );
	};

	const allPhoneNumbers = []; // TODO: Get all phone numbers from the API when it is ready

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
				<div className="margin-top-16">
					<AlertBanner type="warning">
						{ translate( 'You need at least one phone number' ) }
					</AlertBanner>
				</div>
			) }
		</>
	);
}
