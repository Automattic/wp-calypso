import { userSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import Notice from '../../../components/notice';

export const PausedNotificationNotice = () => {
	const { data: settings } = useQuery( userSettingsQuery() );
	const isAllWpcomEmailsDisabled = settings?.subscription_delivery_email_blocked;

	if ( ! isAllWpcomEmailsDisabled ) {
		return null;
	}

	return (
		<Notice
			actions={
				<Link to="/me/notifications/emails">{ __( 'Go to Emails settings and change it' ) }</Link>
			}
			variant="warning"
			title={ __( 'Email notifications are currently paused!' ) }
		>
			{ __( 'You won’t receive any email updates until you change this in Emails settings.' ) }
		</Notice>
	);
};
