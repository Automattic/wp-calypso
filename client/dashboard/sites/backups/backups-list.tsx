import { siteRewindableActivityLogEntriesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from 'react';
import { useBackupState } from '../../app/hooks/site-backup-state';
import { DataViewsCard } from '../../components/dataviews-card';
import { getFields } from './dataviews/fields';
import type { ActivityLogEntry, Site } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

export function BackupsList( {
	site,
	selectedBackup,
	setSelectedBackup,
}: {
	site: Site;
	selectedBackup: ActivityLogEntry | null;
	setSelectedBackup: ( backup: ActivityLogEntry | null ) => void;
} ) {
	const [ view, setView ] = useState< View >( {
		type: 'list',
		fields: [ 'date', 'content_text' ],
		mediaField: 'icon',
		titleField: 'title',
		perPage: 10,
	} );

	const { backup, hasRecentlyCompleted } = useBackupState( site.ID );

	const { data: activityLog = [], isLoading: isLoadingActivityLog } = useQuery( {
		...siteRewindableActivityLogEntriesQuery( site.ID ),
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
		if ( ! isLoadingActivityLog && activityLog.length > 0 && ! selectedBackup ) {
			const firstBackup = activityLog[ 0 ];
			setSelectedBackup( firstBackup );
		}
	}, [ isLoadingActivityLog, activityLog, selectedBackup, setSelectedBackup ] );

	const onChangeSelection = ( selection: string[] ) => {
		const backup =
			selection.length > 0
				? activityLog.find( ( item ) => item.activity_id === selection[ 0 ] ) || null
				: null;
		setSelectedBackup( backup );
	};

	return (
		<DataViewsCard>
			<DataViews< ActivityLogEntry >
				getItemId={ ( item ) => item.activity_id }
				data={ filteredData }
				fields={ fields }
				view={ view }
				onChangeView={ setView }
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
