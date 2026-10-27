import { JETPACK_SUPPORT_CONNECTION_ISSUES } from '@automattic/urls';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import { Notice, NoticeActionLink, RouterNoticeActionLink } from '../../components/notice';
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
					<NoticeActionLink href={ JETPACK_SUPPORT_CONNECTION_ISSUES } openInNewTab>
						{ __( 'Troubleshoot your Jetpack connection' ) }
					</NoticeActionLink>
					{ site && canViewSftpSshSettingsRoute && (
						<RouterNoticeActionLink to={ `/sites/${ site.slug }/settings/sftp-ssh` }>
							{ __( 'Connect over SFTP/SSH' ) }
						</RouterNoticeActionLink>
					) }
				</>
			}
		>
			{ error.message }
		</Notice>
	);
}
