// eslint-disable-next-line no-restricted-imports
import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Notice } from '../../../components/notice';

export const BrowserNotificationNotice = () => {
	return (
		<Notice
			variant="warning"
			density="low"
			actions={
				<>
					<Button
						variant="link"
						href={ localizeUrl( 'https://wordpress.com/support/troubleshoot-browser-block-chat/' ) }
						target="_blank"
						rel="noreferrer"
					>
						{ __( 'View instructions to enable' ) }
					</Button>
				</>
			}
		>
			{ __( 'Your browser is currently set to block notifications from WordPress.com.' ) }
		</Notice>
	);
};
