/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityLogBanner from './index';
import { ProgressBar } from '@automattic/components';
import QueryRewindRestoreStatus from 'components/data/query-rewind-restore-status';
import QueryRewindBackupStatus from 'components/data/query-rewind-backup-status';
import { useLocalizedMoment } from 'components/localized-moment';

/**
 * Normalize timestamp values
 *
 * Some timestamps are in seconds instead
 * of in milliseconds and this will make
 * sure they are all reported in ms
 *
 * The chosen comparison date is older than
 * WordPress so no backups should already
 * exist prior to that date 😉
 *
 * @param {number} ts timestamp in 's' or 'ms'
 * @returns {number} timestamp in 'ms'
 */
const ms = ( ts ) =>
	ts < 946702800000 // Jan 1, 2001 @ 00:00:00
		? ts * 1000 // convert s -> ms
		: ts;

function ProgressBanner( {
	applySiteOffset,
	percent,
	status,
	siteId,
	timestamp,
	restoreId,
	downloadId,
	action,
	context,
} ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	let title = '';
	let description = '';
	let statusMessage = '';

	const dateTime = applySiteOffset( moment( ms( timestamp ) ) ).format( 'LLLL' );

	switch ( action ) {
		case 'restore':
			if ( 'alternate' === context ) {
				title = translate( 'Currently cloning your site' );
				description = translate(
					"We're cloning your site to %(dateTime)s. You'll be notified once it's complete.",
					{ args: { dateTime } }
				);
				statusMessage =
					'queued' === status
						? translate( 'The cloning process will start in a moment.' )
						: translate( 'Away we go! Your site is being cloned.' );
			} else {
				title = translate( 'Currently restoring your site' );
				description = translate(
					"We're restoring your site back to %(dateTime)s. You'll be notified once it's complete.",
					{ args: { dateTime } }
				);
				statusMessage =
					'queued' === status
						? translate( 'Your restore will start in a moment.' )
						: translate( 'Away we go! Your site is being restored.' );
			}
			break;

		case 'backup':
			title = translate( 'Currently creating a downloadable backup of your site' );
			description = translate(
				"We're creating a downloadable backup of your site at %(dateTime)s. You'll be notified once it's complete.",
				{ args: { dateTime } }
			);
			statusMessage =
				0 < percent
					? translate( 'Away we go! Your download is being created.' )
					: translate( 'The creation of your backup will start in a moment.' );
			break;
	}

	return (
		<ActivityLogBanner status="info" title={ title }>
			<div>
				{ 'restore' === action && (
					<QueryRewindRestoreStatus restoreId={ restoreId } siteId={ siteId } />
				) }
				{ 'backup' === action && (
					<QueryRewindBackupStatus downloadId={ downloadId } siteId={ siteId } />
				) }
				<p>{ description }</p>
				<em>{ statusMessage }</em>
			</div>
			{ ( 'running' === status || ( 0 <= percent && percent <= 100 ) ) && (
				<ProgressBar isPulsing value={ percent || 0 } />
			) }
		</ActivityLogBanner>
	);
}

ProgressBanner.propTypes = {
	applySiteOffset: PropTypes.func.isRequired,
	percent: PropTypes.number,
	siteId: PropTypes.number,
	status: PropTypes.oneOf( [ 'queued', 'running', 'fail' ] ),
	timestamp: PropTypes.string,
	action: PropTypes.oneOf( [ 'restore', 'backup' ] ),
};

export default ProgressBanner;
