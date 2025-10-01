import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from 'react';
import { DataViewsCard } from '../../components/dataviews-card';
import { getFields } from './dataviews/fields';
import type { ActivityLogEntry } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

export function BackupsList( {
	selectedBackup,
	setSelectedBackup,
	dateRange,
	timezoneString,
	gmtOffset,
	activityLog,
	isLoadingActivityLog,
}: {
	selectedBackup: ActivityLogEntry | null;
	setSelectedBackup: ( backup: ActivityLogEntry | null ) => void;
	dateRange?: { start: Date; end: Date };
	timezoneString?: string;
	gmtOffset?: number;
	activityLog: ActivityLogEntry[];
	isLoadingActivityLog: boolean;
} ) {
	const [ view, setView ] = useState< View >( {
		type: 'list',
		fields: [ 'date', 'content_text' ],
		mediaField: 'icon',
		titleField: 'title',
		perPage: 10,
	} );

	const fields = getFields( timezoneString, gmtOffset );
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( activityLog, view, fields );

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
				defaultLayouts={ { list: {} } }
				paginationInfo={ paginationInfo }
				searchLabel={ __( 'Search backups' ) }
				onChangeSelection={ onChangeSelection }
				selection={ selectedBackup ? [ selectedBackup.activity_id ] : [] }
			/>
		</DataViewsCard>
	);
}
