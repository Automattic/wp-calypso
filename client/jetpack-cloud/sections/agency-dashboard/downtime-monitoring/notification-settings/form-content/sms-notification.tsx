import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

export default function SMSNotification() {
	const translate = useTranslate();

	const handleToggleClick = () => {
		return null;
	};

	return (
		<>
			<div className="notification-settings__toggle-container">
				<div className="notification-settings__toggle">
					<ToggleControl onChange={ handleToggleClick } />
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
		</>
	);
}
