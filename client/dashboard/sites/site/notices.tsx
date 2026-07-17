import { JETPACK_SUPPORT_CONNECTION_ISSUES } from '@automattic/urls';
import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import { Notice } from '../../components/notice';

export function InaccessibleJetpackNotice( { error }: { error: Error } ) {
	useEffect( () => {
		logToLogstash( {
			feature: 'calypso_client',
			message: error.message,
			tags: [ 'dashboard', 'jetpack-inaccessible' ],
			properties: {
				path: window.location.href,
			},
		} );
	}, [ error.message ] );

	return (
		<Notice
			variant="error"
			title={ __( 'Your Jetpack site cannot be reached at this time.' ) }
			actions={
				<ExternalLink href={ JETPACK_SUPPORT_CONNECTION_ISSUES }>
					{ __( 'Troubleshoot your Jetpack connection' ) }
				</ExternalLink>
			}
		>
			{ error.message }
		</Notice>
	);
}
