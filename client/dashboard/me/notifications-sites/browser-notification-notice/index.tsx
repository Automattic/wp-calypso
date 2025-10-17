// eslint-disable-next-line no-restricted-imports
import { notificationPushPermissionStateQuery } from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Notice } from '../../../components/notice';

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
				<ExternalLink
					href={ localizeUrl(
						'https://wordpress.com/support/notifications/browser-notifications/#troubleshooting'
					) }
				>
					{ __( 'View instructions to enable' ) }
				</ExternalLink>
			}
		>
			{ __(
				'You won’t receive any browser notifications until you enable them in your browser settings.'
			) }
		</Notice>
	);
};
