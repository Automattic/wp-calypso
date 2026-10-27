import { JETPACK_SUPPORT_CONNECTION_ISSUES } from '@automattic/urls';
import { Link } from '@tanstack/react-router';
import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import { Notice } from '../../components/notice';
import { siteTypeSupportsFeature } from '../../utils/site-type-feature-support';
import type { Site } from '@automattic/api-core';

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

	// Deliberately ignores the plan: the SFTP/SSH settings page upsells sites that lack the feature.
	const canViewSftpSshSettingsRoute =
		!! site?.capabilities?.manage_options && siteTypeSupportsFeature( site, 'settingsServer' );

	return (
		<Notice
			variant="error"
			title={ __( 'Your Jetpack site cannot be reached at this time.' ) }
			actions={
				<>
					<ExternalLink href={ JETPACK_SUPPORT_CONNECTION_ISSUES }>
						{ __( 'Troubleshoot your Jetpack connection' ) }
					</ExternalLink>
					{ site && canViewSftpSshSettingsRoute && (
						<Link to={ `/sites/${ site.slug }/settings/sftp-ssh` }>
							{ __( 'Connect over SFTP/SSH' ) }
						</Link>
					) }
				</>
			}
		>
			{ error.message }
		</Notice>
	);
}
