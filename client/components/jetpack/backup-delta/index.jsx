/**
 * External dependencies
 */
import React, { useMemo, useState } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityCard from 'calypso/components/activity-card';
import Pagination from 'calypso/components/pagination';

/**
 * Style dependencies
 */
import './style.scss';

const BACKUPS_PER_PAGE = 10;

const BackupDelta = ( { realtimeBackups, translate, isToday } ) => {
	const [ currentPage, setCurrentPage ] = useState( 1 );

	const onPageChange = ( pageNumber ) => setCurrentPage( pageNumber );

	const cards = useMemo(
		() =>
			realtimeBackups
				.slice( ( currentPage - 1 ) * BACKUPS_PER_PAGE, currentPage * BACKUPS_PER_PAGE )
				.map( ( activity ) => <ActivityCard activity={ activity } key={ activity.activityId } /> ),
		[ currentPage, realtimeBackups ]
	);

	return (
		<div className="backup-delta">
			<div className="backup-delta__realtime">
				<div className="backup-delta__realtime-header">
					{ isToday
						? translate( 'More backups from today' )
						: translate( 'More backups from this day' ) }
				</div>
				<div className="backup-delta__realtime-description">
					{ translate(
						'Your site is backed up in real time (as you make changes) as well as in one daily backup.'
					) }
				</div>
				<Pagination
					page={ currentPage }
					perPage={ BACKUPS_PER_PAGE }
					total={ realtimeBackups.length }
					pageClick={ onPageChange }
				/>
				{ cards.length ? (
					cards
				) : (
					<div className="backup-delta__realtime-emptyday">
						{ translate( 'There were no changes on this day. Your daily backup is above.' ) }
					</div>
				) }
			</div>
			);
		</div>
	);
};

export default localize( BackupDelta );
