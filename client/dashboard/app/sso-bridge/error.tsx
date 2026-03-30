import { __ } from '@wordpress/i18n';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function SsoBridgeError() {
	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Unable to sign in' ) }
					description={ __(
						'This site could not complete the sign-in process because its connection to WordPress.com is not configured correctly.'
					) }
				/>
			}
			notices={
				<Notice variant="error">
					{ __(
						'Please contact support to resolve this issue. Let them know you saw this message while trying to sign in via SSO.'
					) }
				</Notice>
			}
		/>
	);
}
