import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useRef } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useIntlLocale } from '../../app/locale';
import { useFormattedTime } from '../../components/formatted-time';
import { Notice } from '../../components/notice';
import { formatDate } from '../../utils/datetime';
import {
	STAGING_SITE_SYNC_TIMEOUT_MS,
	hasStagingSiteSyncTimedOut,
} from '../../utils/site-staging-site';
import type { Site, StagingSiteSyncState } from '@automattic/api-core';

export * from './use-running-staging-site-sync';

const TAKING_LONG_AFTER_MS = 60 * 60 * 1000;

function getTitle( syncState: StagingSiteSyncState, isPastTimeout: boolean ) {
	if ( isPastTimeout ) {
		return __( 'Your sync seems to be stuck' );
	}

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
	formattedTimeoutTime: string,
	isTakingLong: boolean,
	isPastTimeout: boolean
) {
	if ( isPastTimeout ) {
		return sprintf(
			/* translators: %s is a date, like "today at 10:00". */
			__( 'This sync started %s and doesn’t seem to be working. Please try syncing again.' ),
			formattedStartTime
		);
	}

	if ( isTakingLong ) {
		return sprintf(
			/* translators: %s is a time, like "12:44 PM". */
			__( 'This is taking longer than usual. If it hasn’t finished by %s, try syncing again.' ),
			formattedTimeoutTime
		);
	}

	if ( syncState.status === 'pending' ) {
		return __(
			'We’re syncing your site in the background. You can’t start another sync until this one finishes.'
		);
	}

	return __(
		'Sit back and relax, we’ll take care of this in the background. You can’t start another sync until this one finishes.'
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
	const hasRecordedImpression = useRef( false );
	const locale = useIntlLocale();
	const startedAtMs = syncState.started_at * 1000;
	const formattedStartTime = useFormattedTime(
		syncState.started_at ? new Date( startedAtMs ).toISOString() : '',
		{ timeStyle: 'short' },
		undefined,
		undefined,
		true
	);
	const formattedTimeoutTime = formatDate(
		new Date( startedAtMs + STAGING_SITE_SYNC_TIMEOUT_MS ),
		locale,
		{ timeStyle: 'short' }
	);
	const runningForMs = syncState.started_at ? Date.now() - startedAtMs : 0;
	const isTakingLong = runningForMs > TAKING_LONG_AFTER_MS;
	const isPastTimeout = hasStagingSiteSyncTimedOut( syncState );

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

	return (
		<Notice
			variant={ isPastTimeout ? 'warning' : 'info' }
			title={ getTitle( syncState, isPastTimeout ) }
		>
			{ getDescription(
				syncState,
				formattedStartTime,
				formattedTimeoutTime,
				isTakingLong,
				isPastTimeout
			) }
		</Notice>
	);
}
