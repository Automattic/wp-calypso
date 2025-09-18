import { siteBackupActivityLogEntriesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo } from 'react';
import { useBackupState } from '../../app/hooks/site-backup-state';
import { DataViewsCard } from '../../components/dataviews-card';
import { buildTimeRangeForActivityLog } from '../../utils/site-activity-log';
import { getFields } from './dataviews/fields';
import type { ActivityLogEntry, Site } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

export function BackupsList( {
	site,
	selectedBackup,
	setSelectedBackup,
	autoSelect = true,
	dateRange,
	timezoneString,
	gmtOffset,
}: {
	site: Site;
	selectedBackup: ActivityLogEntry | null;
	setSelectedBackup: ( backup: ActivityLogEntry | null ) => void;
	autoSelect?: boolean;
	dateRange?: { start: Date; end: Date };
	timezoneString?: string;
	gmtOffset?: number;
} ) {
	const [ view, setView ] = useState< View >( {
		type: 'list',
		fields: [ 'date', 'content_text' ],
		mediaField: 'icon',
		titleField: 'title',
		perPage: 10,
	} );

	const { backup, hasRecentlyCompleted } = useBackupState( site.ID );

	const { after, before } = useMemo( () => {
		if ( ! dateRange ) {
			return { after: undefined, before: undefined };
		}

		return buildTimeRangeForActivityLog(
			dateRange.start,
			dateRange.end,
			timezoneString,
			gmtOffset
		);
	}, [ dateRange, timezoneString, gmtOffset ] );

	const { data: activityLog = [], isLoading: isLoadingActivityLog } = useQuery( {
		...siteBackupActivityLogEntriesQuery( site.ID, undefined, true, after, before ),
		// Refetch the activity log every 3 seconds when a recent backup completed until the backup is found in the Activity Log
		refetchInterval: ( query ) => {
			if ( ! backup || ! hasRecentlyCompleted ) {
				return false;
			}

			const backupPeriod = parseInt( backup.period, 10 );
			if ( isNaN( backupPeriod ) ) {
				return false;
			}

			const successFullBackup = query.state.data?.current?.orderedItems?.some(
				( entry ) => entry?.object?.backup_period === backupPeriod
			);

			return successFullBackup ? false : 3000;
		},
	} );

	const fields = getFields();
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( activityLog, view, fields );

	useEffect( () => {
		if ( ! autoSelect || isLoadingActivityLog ) {
			return;
		}

		if ( activityLog.length === 0 ) {
			setSelectedBackup( null );
			return;
		}

		const isCurrentSelectionValid =
			selectedBackup &&
			activityLog.some( ( backup ) => backup.activity_id === selectedBackup.activity_id );

		if ( ! isCurrentSelectionValid ) {
			setSelectedBackup( activityLog[ 0 ] );
		}
	}, [
		autoSelect,
		isLoadingActivityLog,
		activityLog,
		selectedBackup,
		setSelectedBackup,
		dateRange,
	] );

	useEffect( () => {
		setView( ( currentView ) => ( { ...currentView, page: 1 } ) );
	}, [ dateRange ] );

	const onChangeSelection = ( selection: string[] ) => {
		const backup =
			selection.length > 0
				? activityLog.find( ( item ) => item.activity_id === selection[ 0 ] ) || null
				: null;
		setSelectedBackup( backup );
	};

	const onChangeView = ( newView: View ) => {
		setView( newView );
	};

	return (
		<DataViewsCard>
			<DataViews< ActivityLogEntry >
				getItemId={ ( item ) => item.activity_id }
				data={ filteredData }
				fields={ fields }
				view={ view }
				onChangeView={ onChangeView }
				isLoading={ isLoadingActivityLog }
				defaultLayouts={ { table: {} } }
				paginationInfo={ paginationInfo }
				searchLabel={ __( 'Search backups' ) }
				onChangeSelection={ onChangeSelection }
				selection={ selectedBackup ? [ selectedBackup.activity_id ] : [] }
			/>
		</DataViewsCard>
	);
}
