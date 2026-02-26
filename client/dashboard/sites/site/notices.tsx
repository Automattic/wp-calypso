import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Notice } from '../../components/notice';

export function InaccessibleJetpackNotice( { error }: { error: Error } ) {
	return (
		<Notice
			variant="error"
			title={ __( 'Your Jetpack site can not be reached at this time.' ) }
			actions={
				<ExternalLink href="https://jetpack.com/support/getting-started-with-jetpack/fixing-jetpack-connection-issues/">
					{ __( 'Troubleshoot your Jetpack connection' ) }
				</ExternalLink>
			}
		>
			{ error.message }
		</Notice>
	);
}
