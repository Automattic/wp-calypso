import { stagingSiteSyncStateQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useRef } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useHelpCenter } from '../../app/help-center';
import { useFormattedTime } from '../../components/formatted-time';
import { Notice } from '../../components/notice';
import { getProductionSiteId, isStagingSiteSyncing } from '../../utils/site-staging-site';
import type { Site, StagingSiteSyncState } from '@automattic/api-core';

const TAKING_LONG_AFTER_MS = 60 * 60 * 1000;

/**
 * The site's staging sync state while a sync is running, or `null` otherwise.
 */
export function useRunningStagingSiteSync( site: Site ): StagingSiteSyncState | null {
	const productionSiteId = getProductionSiteId( site );
	const { data: syncState } = useQuery( {
		...stagingSiteSyncStateQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
		refetchInterval: ( query ) => ( isStagingSiteSyncing( query.state.data ) ? 5000 : false ),
		refetchIntervalInBackground: true,
	} );

	return syncState && isStagingSiteSyncing( syncState ) ? syncState : null;
}

function getTitle( syncState: StagingSiteSyncState ) {
	if ( syncState.status === 'pending' ) {
		return __( 'Sync starting…' );
	}

	const step = syncState.status === 'backing_up' ? 1 : 2;

	return syncState.direction === 'pull'
		? sprintf(
				/* translators: %d is the current step of the sync, 1 or 2. */
				__( 'Syncing staging to production… (step %d of 2)' ),
				step
			)
		: sprintf(
				/* translators: %d is the current step of the sync, 1 or 2. */
				__( 'Syncing production to staging… (step %d of 2)' ),
				step
			);
}

function getDescription(
	syncState: StagingSiteSyncState,
	formattedStartTime: string,
	isTakingLong: boolean
) {
	if ( isTakingLong ) {
		return sprintf(
			/* translators: %s is a date, like "today at 10:00". */
			__(
				'This sync started %s and is taking longer than usual. You can’t start another sync until this one finishes.'
			),
			formattedStartTime
		);
	}

	if ( syncState.status === 'pending' || ! formattedStartTime ) {
		return __(
			'We’re syncing your site in the background. You can’t start another sync until this one finishes.'
		);
	}

	return sprintf(
		/* translators: %s is a date, like "today at 10:00". */
		__(
			'This sync started %s. Sit back and relax, we’ll take care of this in the background. You can’t start another sync until this one finishes.'
		),
		formattedStartTime
	);
}

/**
 * Renders an info Notice describing the staging sync that is currently running.
 */
export function StagingSiteSyncNotice( {
	site,
	syncState,
}: {
	site: Site;
	syncState: StagingSiteSyncState;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const { setOpenOdieWithContext } = useHelpCenter();
	const hasRecordedImpression = useRef( false );
	const formattedStartTime = useFormattedTime(
		syncState.started_at ? new Date( syncState.started_at * 1000 ).toISOString() : '',
		{ timeStyle: 'short' },
		undefined,
		undefined,
		true
	);
	const isTakingLong =
		!! syncState.started_at && Date.now() - syncState.started_at * 1000 > TAKING_LONG_AFTER_MS;

	useEffect( () => {
		if ( hasRecordedImpression.current ) {
			return;
		}
		hasRecordedImpression.current = true;
		recordTracksEvent( 'calypso_dashboard_staging_site_sync_notice_impression', {
			site_id: site.ID,
			status: syncState.status,
			direction: syncState.direction,
			is_taking_long: isTakingLong,
		} );
	}, [ recordTracksEvent, site.ID, syncState.status, syncState.direction, isTakingLong ] );

	const handleContactClick = () => {
		recordTracksEvent( 'calypso_dashboard_staging_site_sync_notice_contact_click', {
			site_id: site.ID,
			status: syncState.status,
		} );
		setOpenOdieWithContext( {
			initialMessage: __( 'My staging site sync hasn’t finished.' ),
			section: 'site-overview',
			siteUrl: site.URL,
			siteId: site.ID,
		} );
	};

	return (
		<Notice
			variant="info"
			title={ getTitle( syncState ) }
			actions={
				isTakingLong && (
					<Button variant="link" onClick={ handleContactClick }>
						{ __( 'Contact support' ) }
					</Button>
				)
			}
		>
			{ getDescription( syncState, formattedStartTime, isTakingLong ) }
		</Notice>
	);
}
