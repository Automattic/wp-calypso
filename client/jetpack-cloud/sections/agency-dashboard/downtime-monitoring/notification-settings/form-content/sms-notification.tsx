import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import ContactList from '../../contact-list';
import FeatureRestrictionBadge from '../../feature-restriction-badge';
import { RestrictionType } from '../../types';
import UpgradeLink from '../../upgrade-link';
import type { MonitorSettings, StateMonitorSettingsSMS } from '../../../sites-overview/types';

interface Props {
	recordEvent: ( action: string, params?: object ) => void;
	enableSMSNotification: boolean;
	setEnableSMSNotification: ( isEnabled: boolean ) => void;
	toggleModal: () => void;
	allPhoneItems: Array< StateMonitorSettingsSMS >;
	verifiedItem?: { [ key: string ]: string };
	restriction: RestrictionType;
	settings?: MonitorSettings;
}

export default function SMSNotification( {
	recordEvent,
	enableSMSNotification,
	setEnableSMSNotification,
	toggleModal,
	allPhoneItems,
	verifiedItem,
	restriction,
	settings,
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
					<ToggleControl
						label={
							enableSMSNotification
								? translate( 'Disable SMS notifications' )
								: translate( 'Enable SMS notifications' )
						}
						onChange={ handleToggleClick }
						checked={ enableSMSNotification }
						className="notification-settings__toggle-control"
						disabled={ restriction !== 'none' }
					/>
				</div>
				<div className="notification-settings__toggle-content">
					<div className="notification-settings__content-heading-with-beta">
						<div className="notification-settings__content-heading">
							{ translate( 'SMS Notification' ) }
							<FeatureRestrictionBadge restriction={ restriction } />
						</div>
					</div>
					<div className="notification-settings__content-sub-heading">
						{ translate( 'Set up text messages to send to one or more people.' ) }
					</div>
					{ restriction === 'upgrade_required' && (
						<div>
							<UpgradeLink />
						</div>
					) }
				</div>
			</div>
			{ enableSMSNotification && (
				<ContactList
					type="sms"
					onAction={ toggleModal }
					items={ allPhoneItems }
					recordEvent={ recordEvent }
					verifiedItemKey={ verifiedItem?.phone }
					settings={ settings }
				/>
			) }
		</>
	);
}
