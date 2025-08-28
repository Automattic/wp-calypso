import { useQuery } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from 'react';
import { useBackupState } from '../../app/hooks/site-backup-state';
import { siteRewindableActivityLogEntriesQuery } from '../../app/queries/site-activity-log';
import { DataViewsCard } from '../../components/dataviews-card';
import { getFields } from './dataviews/fields';
import type { ActivityLogEntry, Site } from '../../data/types';
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

	const { hasRecentlyCompleted } = useBackupState( site.ID );

	const { data: activityLog = [], isLoading: isLoadingActivityLog } = useQuery( {
		...siteRewindableActivityLogEntriesQuery( site.ID ),
		refetchInterval: hasRecentlyCompleted ? 3000 : false,
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
