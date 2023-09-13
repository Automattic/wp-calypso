import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

interface Props {
	recordEvent: ( action: string, params?: object ) => void;
	enableMobileNotification: boolean;
	setEnableMobileNotification: ( isEnabled: boolean ) => void;
}

export default function MobilePushNotification( {
	recordEvent,
	enableMobileNotification,
	setEnableMobileNotification,
}: Props ) {
	const translate = useTranslate();

	return (
		<div className="notification-settings__toggle-container">
			<div className="notification-settings__toggle">
				<ToggleControl
					label={
						enableMobileNotification
							? translate( 'Disable mobile notifications' )
							: translate( 'Enable mobile notifications' )
					}
					onChange={ ( isEnabled ) => {
						recordEvent( isEnabled ? 'mobile_notification_enable' : 'mobile_notification_disable' );
						setEnableMobileNotification( isEnabled );
					} }
					checked={ enableMobileNotification }
					className="notification-settings__toggle-control"
				/>
			</div>
			<div className="notification-settings__toggle-content">
				<div className="notification-settings__content-heading">{ translate( 'Push' ) }</div>
				<div className="notification-settings__content-sub-heading">
					{ translate( 'Receive notifications via the {{a}}Jetpack App{{/a}}.', {
						components: {
							a: (
								<a
									className="notification-settings__link"
									target="_blank"
									rel="noreferrer"
									href="https://jetpack.com/mobile/"
								/>
							),
						},
					} ) }
				</div>
			</div>
		</div>
	);
}
