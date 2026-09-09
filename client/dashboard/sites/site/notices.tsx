import { JETPACK_SUPPORT_CONNECTION_ISSUES } from '@automattic/urls';
import { Link } from '@tanstack/react-router';
import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import { Notice } from '../../components/notice';
import { canAccessSftpSettings } from '../../utils/site-features';
import type { Site } from '@automattic/api-core';

// `site` is optional because the site error boundary renders this notice when
// the site request itself failed and there is no site to read.
export function InaccessibleJetpackNotice( { error, site }: { error: Error; site?: Site } ) {
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
				<>
					{ site && canAccessSftpSettings( site ) && (
						<Link to={ `/sites/${ site.slug }/settings/sftp-ssh` }>
							{ __( 'Connect over SFTP/SSH' ) }
						</Link>
					) }
					<ExternalLink href={ JETPACK_SUPPORT_CONNECTION_ISSUES }>
						{ __( 'Troubleshoot your Jetpack connection' ) }
					</ExternalLink>
				</>
			}
		>
			{ error.message }
		</Notice>
	);
}
