// eslint-disable-next-line no-restricted-imports
import { notificationPushPermissionStateQuery } from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { Notice, NoticeActionLink } from '../../../components/notice';

export const BrowserNotificationNotice = () => {
	const { data: status } = useQuery( notificationPushPermissionStateQuery() );

	if ( status !== 'denied' ) {
		return null;
	}

	return (
		<Notice
			variant="warning"
			title={ __( 'Browser notifications are blocked' ) }
			actions={
				<NoticeActionLink
					href={ localizeUrl(
						'https://wordpress.com/support/notifications/browser-notifications/#troubleshooting'
					) }
					openInNewTab
				>
					{ __( 'View instructions to enable' ) }
				</NoticeActionLink>
			}
		>
			{ __(
				'You won’t receive any browser notifications until you enable them in your browser settings.'
			) }
		</Notice>
	);
};
