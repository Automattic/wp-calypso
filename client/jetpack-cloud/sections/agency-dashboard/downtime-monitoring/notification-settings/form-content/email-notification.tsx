import { isEnabled } from '@automattic/calypso-config';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import ContactList from '../../contact-list';
import { RestrictionType } from '../../types';
import type { StateMonitorSettingsEmail } from '../../../sites-overview/types';

interface Props {
	recordEvent: ( action: string, params?: object ) => void;
	verifiedItem?: { [ key: string ]: string };
	enableEmailNotification: boolean;
	setEnableEmailNotification: ( isEnabled: boolean ) => void;
	defaultUserEmailAddresses: string[];
	toggleAddEmailModal: () => void;
	allEmailItems: StateMonitorSettingsEmail[];
	restriction: RestrictionType;
}

export default function EmailNotification( {
	recordEvent,
	verifiedItem,
	enableEmailNotification,
	setEnableEmailNotification,
	defaultUserEmailAddresses,
	toggleAddEmailModal,
	allEmailItems,
	restriction,
}: Props ) {
	const translate = useTranslate();

	const isPaidTierEnabled = isEnabled( 'jetpack/pro-dashboard-monitor-paid-tier' );

	return (
		<>
			<div className="notification-settings__toggle-container">
				<div className="notification-settings__toggle">
					<ToggleControl
						label={
							enableEmailNotification
								? translate( 'Disable email notifications' )
								: translate( 'Enable email notifications' )
						}
						onChange={ ( isEnabled ) => {
							recordEvent( isEnabled ? 'email_notification_enable' : 'email_notification_disable' );
							setEnableEmailNotification( isEnabled );
						} }
						checked={ enableEmailNotification }
						className="notification-settings__toggle-control"
					/>
				</div>
				<div className="notification-settings__toggle-content">
					<div className="notification-settings__content-heading-with-beta">
						<div className="notification-settings__content-heading">{ translate( 'Email' ) }</div>
					</div>
					{ isPaidTierEnabled ? (
						<>
							<div className="notification-settings__content-sub-heading">
								{ translate( 'Receive email notifications with one or more recipients.' ) }
							</div>
						</>
					) : (
						<div className="notification-settings__content-sub-heading">
							{ translate( 'Receive email notifications with your account email address %s.', {
								args: defaultUserEmailAddresses,
							} ) }
						</div>
					) }
				</div>
			</div>

			{ enableEmailNotification && isPaidTierEnabled && (
				<ContactList
					type="email"
					onAction={ toggleAddEmailModal }
					items={ allEmailItems }
					recordEvent={ recordEvent }
					verifiedItemKey={ verifiedItem?.email }
					restriction={ restriction }
				/>
			) }
		</>
	);
}
