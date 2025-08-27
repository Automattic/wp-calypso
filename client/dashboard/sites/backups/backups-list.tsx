import { useQuery } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useRef } from 'react';
import { useBackupState } from '../../app/hooks/site-backup-state';
import { siteRewindableActivityLogEntriesQuery } from '../../app/queries/site-activity-log';
import DataViewsCard from '../../components/dataviews-card';
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

	// Track if user has manually selected something during active backup
	const hasManualSelectionRef = useRef( false );

	const { backupState, hasRecentlyCompleted } = useBackupState( site.ID );

	const { data: activityLog = [], isLoading: isLoadingActivityLog } = useQuery( {
		...siteRewindableActivityLogEntriesQuery( site.ID ),
		refetchInterval: hasRecentlyCompleted ? 3000 : false,
	} );

	const fields = getFields();
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( activityLog, view, fields );

	useEffect( () => {
		if ( ! isLoadingActivityLog && activityLog.length > 0 ) {
			// Unselect item when backup becomes active (to show progress view), but only if user hasn't manually selected
			if ( backupState !== 'default' && selectedBackup && ! hasManualSelectionRef.current ) {
				setSelectedBackup( null );
			}

			// Auto-select first item when no item is selected and no backup is active
			else if ( ! selectedBackup && backupState === 'default' ) {
				setSelectedBackup( activityLog[ 0 ] );
				hasManualSelectionRef.current = false; // Reset manual selection flag
			}
		}
	}, [ isLoadingActivityLog, activityLog, selectedBackup, setSelectedBackup, backupState ] );

	const onChangeSelection = ( selection: string[] ) => {
		const backup =
			selection.length > 0
				? activityLog.find( ( item ) => item.activity_id === selection[ 0 ] ) || null
				: null;

		// Mark that user has made a manual selection during active backup
		if ( backupState !== 'default' ) {
			hasManualSelectionRef.current = true;
		}

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
