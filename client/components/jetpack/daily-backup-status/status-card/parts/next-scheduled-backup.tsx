import { LoadingPlaceholder } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useNextBackupSchedule } from 'calypso/components/jetpack/backup-schedule-setting/hooks';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';

type Props = {
	siteId: number;
};

const NextScheduledBackup: FunctionComponent< Props > = ( { siteId } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	const { hasLoaded, date, timeRange } = useNextBackupSchedule();

	if ( ! hasLoaded ) {
		return (
			<div className="status-card__scheduled-backup placeholder">
				<LoadingPlaceholder />
			</div>
		);
	}

	if ( ! date || ! timeRange ) {
		return null;
	}

	const onModifyClick = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_schedule_modify_click' ) );
	};

	return (
		<div className="status-card__scheduled-backup">
			<span className="scheduled-backup__message">
				{ translate( 'Next full backup: %(date)s, between %(timeRange)s.', {
					args: {
						date: date.format( 'MMM D' ),
						timeRange: timeRange,
					},
					comment:
						'%(date)s is the formatted date (e.g., Oct 22), and %(timeRange)s is a time range, such as 10:00-10:59 AM.',
				} ) }
			</span>
			<a
				href={ `${ settingsPath( siteSlug ) }#backup-schedule` }
				className="scheduled-backup__action"
				onClick={ onModifyClick }
			>
				{ ' ' }
				{ translate( 'Modify' ) }
			</a>
		</div>
	);
};

export default NextScheduledBackup;
