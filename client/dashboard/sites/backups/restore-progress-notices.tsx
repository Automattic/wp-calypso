import { dismissSiteRestoreMutation } from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { JETPACK_CONTACT_SUPPORT } from '@automattic/urls';
import { useMutation } from '@tanstack/react-query';
import { Button, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useFormattedTime } from '../../components/formatted-time';
import InlineSupportLink from '../../components/inline-support-link';
import { Notice } from '../../components/notice';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import { useRewindState } from './use-rewind-state';
import type { Site } from '@automattic/api-core';

interface RestoreProgressNoticesProps {
	site: Site;
	timezoneString?: string;
	gmtOffset?: number;
}

/**
 * Renders contextual notices based on the site's restore status
 */
export function RestoreProgressNotices( {
	site,
	timezoneString,
	gmtOffset,
}: RestoreProgressNoticesProps ) {
	const { hasActiveRestore, hasFinishedRestore, hasFailedRestore, restoreProgress, restoreId } =
		useRewindState( site.ID );

	const dismissRestore = useMutation( dismissSiteRestoreMutation( site.ID ) );

	const restoreDate = useFormattedTime(
		restoreProgress?.rewindId
			? new Date( parseInt( restoreProgress.rewindId ) * 1000 ).toISOString()
			: '',
		{
			timeStyle: 'short',
		},
		timezoneString,
		gmtOffset,
		true
	);

	const notices = [];

	if ( hasActiveRestore && restoreProgress ) {
		notices.push(
			<Notice
				key="restore-progress"
				variant="info"
				title={ sprintf(
					/* translators: %d is the restore progress percentage. */ __(
						'Restoring your site… (%d%% progress)'
					),
					restoreProgress?.percent ?? 0
				) }
			>
				{ sprintf(
					/* translators: %s is a date, like "Monday, 20 October 2025 18:46". */
					__( 'We’re restoring your site back to %s. You’ll be notified once it’s complete.' ),
					restoreDate
				) }
			</Notice>
		);
	}

	if ( hasFinishedRestore && restoreProgress && restoreId ) {
		notices.push(
			<Notice
				key="restore-success"
				variant="success"
				title={ __( 'Your site has been successfully restored' ) }
				onClose={ () => dismissRestore.mutate( restoreId ) }
				actions={
					<Button variant="primary" href={ site.URL } target="_blank">
						{ __( 'View site' ) }
					</Button>
				}
			>
				{ sprintf(
					/* translators: %s is a date, like "Monday, 20 October 2025 18:46" */
					__( 'We successfully restored your site back to %s!' ),
					restoreDate
				) }
			</Notice>
		);
	}

	if ( hasFailedRestore && restoreProgress && restoreId ) {
		notices.push(
			<Notice
				key="restore-error"
				variant="error"
				title={ __( "Restore couldn't be completed" ) }
				onClose={ () => dismissRestore.mutate( restoreId ) }
				actions={
					<Button variant="primary" href={ JETPACK_CONTACT_SUPPORT } target="_blank">
						{ __( 'Contact support' ) }
					</Button>
				}
			>
				{ createInterpolateElement(
					sprintf(
						/* translators: %s is a date, like "Monday, 20 October 2025 18:46" */
						__(
							'We weren’t able to restore your site back to %1$s. <external>Check our help guide</external> or contact support to get this resolved.'
						),
						restoreDate
					),
					{
						external: isSelfHostedJetpackConnected( site ) ? (
							<ExternalLink
								href={ localizeUrl( 'https://jetpack.com/support/backup/' ) }
								children={ null }
							/>
						) : (
							<InlineSupportLink supportContext="backups" children={ null } />
						),
					}
				) }
			</Notice>
		);
	}

	return <>{ notices }</>;
}
