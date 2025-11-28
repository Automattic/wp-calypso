import { siteBackupActivityLogGroupCountsQuery, siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery, useQuery } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo } from 'react';
import { siteRoute } from '../../app/router/sites';
import { DataViewsCard } from '../../components/dataviews';
import { buildTimeRangeForActivityLog } from '../../utils/site-activity-log';
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
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const [ view, setView ] = useState< View >( {
		type: 'list',
		fields: [ 'date', 'content_text' ],
		mediaField: 'icon',
		titleField: 'title',
		perPage: 10,
	} );

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

	const { data: groupCountsData } = useQuery(
		siteBackupActivityLogGroupCountsQuery( site.ID, after, before )
	);

	const fields = getFields( groupCountsData?.groups, timezoneString, gmtOffset );
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
				empty={
					<p>
						{ view.search
							? __( 'No results for this search term' )
							: __( 'No results for this period' ) }
					</p>
				}
			/>
		</DataViewsCard>
	);
}
