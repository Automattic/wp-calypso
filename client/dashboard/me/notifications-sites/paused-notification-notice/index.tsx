import { userSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import Notice, { RouterNoticeActionLink } from '../../../components/notice';

export const PausedNotificationNotice = () => {
	const { data: settings } = useQuery( userSettingsQuery() );
	const isAllWpcomEmailsDisabled = settings?.subscription_delivery_email_blocked;

	if ( ! isAllWpcomEmailsDisabled ) {
		return null;
	}

	return (
		<Notice
			actions={
				<RouterNoticeActionLink to="/me/notifications/emails">
					{ __( 'Update email preferences' ) }
				</RouterNoticeActionLink>
			}
			variant="warning"
			title={ __( 'Email updates are turned off until you change your settings' ) }
		>
			{ __(
				'All your email updates are paused. You won’t receive newsletters or site updates until you change your notification settings.'
			) }
		</Notice>
	);
};
