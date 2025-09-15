// eslint-disable-next-line no-restricted-imports
import { localizeUrl } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Notice } from '../../../components/notice';

export const BrowserNotificationNotice = () => {
	return (
		<Notice
			variant="warning"
			density="low"
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
			{ __( 'Your browser is currently set to block notifications from WordPress.com.' ) }
		</Notice>
	);
};
