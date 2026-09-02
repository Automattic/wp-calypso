import page from '@automattic/calypso-router';
import { DateRangePicker } from '@automattic/date-range-picker';
import { Button, Notice } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import { DataViews } from 'calypso/components/dataviews';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { buildTimeRangeForActivityLog } from 'calypso/dashboard/utils/site-activity-log';
import useRewindableActivityLogQuery from 'calypso/data/activity-log/use-rewindable-activity-log-query';
import {
	INDEX_FORMAT,
	isActivityBackup,
	isSuccessfulRealtimeBackup,
} from 'calypso/lib/jetpack/backup-utils';
import { useDispatch, useSelector } from 'calypso/state';
import { rewindRequestBackup } from 'calypso/state/activity-log/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import canRestoreSite from 'calypso/state/rewind/selectors/can-restore-site';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { backupContentsPath, backupDownloadPath, backupRestorePath } from '../paths';
import { getFields } from './fields';
import type { BackupActivity } from './types';
import type { Action, View } from '@wordpress/dataviews';

import './style.scss';

const DEFAULT_VIEW: View = {
	type: 'table',
	fields: [ 'date', 'event', 'user' ],
	perPage: 20,
	page: 1,
	sort: {
		field: 'date',
		direction: 'desc',
	},
	layout: {
		styles: {
			date: { width: '220px' },
			event: { width: '100%' },
			user: { width: '200px' },
		},
	},
};

const isBackupActivity = ( activity: BackupActivity ) =>
	isActivityBackup( activity ) || isSuccessfulRealtimeBackup( activity );

export default function BackupsDataViews( { queryDate }: { queryDate?: string } ) {
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();

	const siteId = useSelector( getSelectedSiteId ) as number;
	const siteSlug = useSelector( getSelectedSiteSlug ) as string;
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );
	const locale = useSelector( getCurrentUserLocale ) || 'en';
	const isRestoreEnabled = useSelector( ( state ) => canRestoreSite( state, siteId ) );

	const [ dateRange, setDateRange ] = useState( () => {
		if ( queryDate ) {
			const day = moment( queryDate, INDEX_FORMAT );
			if ( day.isValid() ) {
				return { start: day.toDate(), end: day.toDate() };
			}
		}
		return {
			start: moment().subtract( 29, 'days' ).toDate(),
			end: moment().toDate(),
		};
	} );

	const [ view, setView ] = useState< View >( DEFAULT_VIEW );

	const { after, before } = useMemo(
		() =>
			buildTimeRangeForActivityLog(
				dateRange.start,
				dateRange.end,
				timezone ?? undefined,
				gmtOffset ?? undefined
			),
		[ dateRange, timezone, gmtOffset ]
	);

	const { data, isLoading, isError, refetch } = useRewindableActivityLogQuery(
		siteId,
		{ after, before, aggregate: false, number: 1000 },
		{
			enabled: !! siteId,
			select: ( activities: BackupActivity[] ) => activities.filter( isBackupActivity ),
			refetchOnWindowFocus: false,
		}
	);
	const backups = useMemo( () => ( data ?? [] ) as BackupActivity[], [ data ] );

	const actions = useMemo( (): Action< BackupActivity >[] => {
		const hasRewindId = ( item: BackupActivity ) => !! item.rewindId;
		const isRestorable = ( item: BackupActivity ) =>
			!! ( isRestoreEnabled && item.activityIsRewindable && item.rewindId );

		return [
			{
				id: 'restore',
				label: __( 'Restore to this point' ),
				isEligible: isRestorable,
				callback: ( [ item ] ) => {
					dispatch(
						recordTracksEvent( 'calypso_jetpack_backup_dataviews_restore_click', {
							rewind_id: item.rewindId,
						} )
					);
					page( backupRestorePath( siteSlug, String( item.rewindId ) ) );
				},
			},
			{
				id: 'download',
				label: __( 'Download backup' ),
				isEligible: hasRewindId,
				callback: ( [ item ] ) => {
					if ( ! item.rewindId ) {
						return;
					}
					dispatch( rewindRequestBackup( siteId, item.rewindId ) );
					dispatch(
						recordTracksEvent( 'calypso_jetpack_backup_dataviews_download_click', {
							rewind_id: item.rewindId,
						} )
					);
					page( backupDownloadPath( siteSlug, String( item.rewindId ) ) );
				},
			},
			{
				id: 'browse-files',
				label: __( 'Browse files' ),
				isEligible: ( item ) => !! ( item.activityIsRewindable && item.rewindId ),
				callback: ( [ item ] ) => {
					dispatch( recordTracksEvent( 'calypso_jetpack_backup_dataviews_browse_click' ) );
					page( backupContentsPath( siteSlug, String( item.rewindId ) ) );
				},
			},
		];
	}, [ dispatch, siteId, siteSlug, isRestoreEnabled ] );

	const fields = useMemo(
		() => getFields( { moment, timezone, gmtOffset } ),
		[ moment, timezone, gmtOffset ]
	);

	const { data: visibleBackups, paginationInfo } = useMemo(
		() => filterSortAndPaginate( backups, view, fields ),
		[ backups, view, fields ]
	);

	const onDateRangeChange = useCallback( ( next: { start: Date; end: Date } ) => {
		setDateRange( next );
		setView( ( previousView ) => ( { ...previousView, page: 1 } ) );
	}, [] );

	if ( isError ) {
		return (
			<Notice status="error" isDismissible={ false }>
				{ __( 'We couldn’t load your backups. Please try again.' ) }
				<Button variant="link" onClick={ () => refetch() }>
					{ __( 'Retry' ) }
				</Button>
			</Notice>
		);
	}

	return (
		<div className="backup-dataviews">
			<div className="backup-dataviews__controls">
				<DateRangePicker
					start={ dateRange.start }
					end={ dateRange.end }
					gmtOffset={ gmtOffset ?? undefined }
					timezoneString={ timezone ?? undefined }
					locale={ locale }
					defaultFallbackPreset="last-30-days"
					onChange={ onDateRangeChange }
				/>
			</div>
			<div className="backup-dataviews__list">
				<DataViews< BackupActivity >
					data={ visibleBackups }
					fields={ fields }
					view={ view }
					onChangeView={ setView }
					actions={ actions }
					getItemId={ ( item ) => String( item.activityId ) }
					isLoading={ isLoading }
					defaultLayouts={ { table: {} } }
					paginationInfo={ paginationInfo }
					searchLabel={ __( 'Search backups' ) }
					empty={
						<p>
							{ view.search
								? __( 'No backups match your search.' )
								: __( 'No backups found in this date range.' ) }
						</p>
					}
				/>
			</div>
		</div>
	);
}
