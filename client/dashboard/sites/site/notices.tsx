import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Notice } from '../../components/notice';

export function InaccessibleJetpackNotice() {
	return (
		<Notice
			variant="warning"
			title={ __( 'Your Jetpack site can not be reached at this time.' ) }
			actions={
				<ExternalLink href="https://jetpack.com/support/getting-started-with-jetpack/fixing-jetpack-connection-issues/">
					{ __( 'Troubleshoot your Jetpack connection' ) }
				</ExternalLink>
			}
		>
			{ __(
				'We‘re having trouble connecting to your site, so we can‘t sync data or make updates at the moment. Your site may still be working normally for visitors.'
			) }
		</Notice>
	);
}
