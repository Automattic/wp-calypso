/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityLogBanner from './index';
import QueryRewindBackupStatus from 'components/data/query-rewind-backup-status';

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
 * @param {Number} ts timestamp in 's' or 'ms'
 * @returns {Number} timestamp in 'ms'
 */
const ms = ts =>
	ts < 946702800000 // Jan 1, 2001 @ 00:00:00
		? ts * 1000 // convert s -> ms
		: ts;

function ProgressBanner( {
	applySiteOffset,
	moment,
	percent,
	siteId,
	timestamp,
	translate,
	downloadId,
	action,
} ) {
	return (
		<ActivityLogBanner
			status="info"
			title={
				'restore' === action
					? translate( 'Currently restoring your site' )
					: translate( 'Currently creating a downloadable backup of your site' )
			}
		>
			<div>
				<QueryRewindBackupStatus downloadId={ downloadId } siteId={ siteId } />
				<p>
					{ translate(
						"We're in the process of creating a downloadable backup of your site at %s. " +
							"You'll be notified once it's complete.",
						{ args: applySiteOffset( moment.utc( ms( timestamp ) ) ).format( 'LLLL' ) }
					) }
				</p>
				<em>
					{ 0 < percent
						? translate( "We're on it! Your download is being created." )
						: translate( 'The creation of your backup will start in a moment.' ) }
				</em>
			</div>
		</ActivityLogBanner>
	);
}

ProgressBanner.propTypes = {
	applySiteOffset: PropTypes.func.isRequired,
	percent: PropTypes.number,
	siteId: PropTypes.number,
	timestamp: PropTypes.string,
};

export default localize( ProgressBanner );
