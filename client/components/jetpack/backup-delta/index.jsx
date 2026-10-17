import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import ActivityCard from 'calypso/components/activity-card';
import {
	BackupKnownThreatsDetails,
	BackupKnownThreatsToggle,
	useBackupKnownThreats,
} from 'calypso/components/jetpack/daily-backup-status/known-threats';
import Pagination from 'calypso/components/pagination';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const BACKUPS_PER_PAGE = 10;

function BackupDeltaRow( { siteId, activity } ) {
	const knownThreats = useBackupKnownThreats( siteId, activity.rewindId );
	const isFlagged = knownThreats.flagged !== null;

	return (
		<ActivityCard
			activity={ activity }
			toolbarExtraContent={
				isFlagged ? <BackupKnownThreatsToggle state={ knownThreats } inToolbar /> : undefined
			}
		>
			{ isFlagged && <BackupKnownThreatsDetails state={ knownThreats } /> }
		</ActivityCard>
	);
}

export default function BackupDelta( { realtimeBackups, isToday } ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const [ currentPage, setCurrentPage ] = useState( 1 );

	const onPageChange = ( pageNumber ) => setCurrentPage( pageNumber );

	const cards = useMemo(
		() =>
			realtimeBackups
				.slice( ( currentPage - 1 ) * BACKUPS_PER_PAGE, currentPage * BACKUPS_PER_PAGE )
				.map( ( activity ) => (
					<BackupDeltaRow key={ activity.activityId } siteId={ siteId } activity={ activity } />
				) ),
		[ currentPage, realtimeBackups, siteId ]
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
		</div>
	);
}
