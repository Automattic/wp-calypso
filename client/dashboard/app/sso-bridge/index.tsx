import { __ } from '@wordpress/i18n';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function SsoBridge() {
	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Unable to sign in' ) }
					description={ __(
						'Something went wrong while signing you in. Please try again by navigating back to your site.'
					) }
				/>
			}
			notices={
				<Notice variant="error">
					{ __(
						'If the problem persists, please contact support and let them know you saw this message while trying to sign in via SSO.'
					) }
				</Notice>
			}
		/>
	);
}
