import { hostingUpdateSchedulesQuery, sitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, FormToggle } from '@wordpress/components';
import { DataViews, type Field, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { format, fromUnixTime } from 'date-fns';
import { useState, useMemo } from 'react';
import {
	pluginsScheduledUpdatesNewRoute,
	pluginsScheduledUpdatesRoute,
} from '../../app/router/plugins';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SiteIconLink } from '../../sites/site-fields';
import { ScheduledUpdateRow } from './types';

export const fields: Field< ScheduledUpdateRow >[] = [
	{
		id: 'site',
		type: 'text',
		label: __( 'Site' ),
		getValue: ( { item } ) => item.site.name,
	},
	{
		id: 'lastUpdate',
		type: 'text',
		label: __( 'Last Update' ),
		render: ( { item } ) =>
			item.lastUpdate ? format( fromUnixTime( item.lastUpdate ), 'MMM d, yyyy H:mm' ) : '-',
	},
	{
		id: 'nextUpdate',
		type: 'text',
		label: __( 'Next Update' ),
		render: ( { item } ) => format( fromUnixTime( item.nextUpdate ), 'MMM d, yyyy H:mm' ),
	},
	{
		id: 'schedule',
		type: 'text',
		label: __( 'Frequency' ),
		render: ( { item } ) => item.schedule[ 0 ].toUpperCase() + item.schedule.slice( 1 ),
	},
	{
		id: 'active',
		type: 'text',
		label: __( 'Active' ),
		render: ( { item } ) => <FormToggle checked={ item.active } onChange={ () => {} } />,
	},
	{
		id: 'actions',
		type: 'text',
		label: __( 'Actions' ),
	},
	{
		id: 'scheduleId',
		label: __( 'Schedule' ),
	},
	{
		id: 'icon.ico',
		label: __( 'Site icon' ),
		render: ( { item } ) => <SiteIconLink site={ item.site } />,
		enableSorting: false,
		enableGlobalSearch: false,
	},
];

export const defaultView: View = {
	type: 'table',
	perPage: 14,
	page: 1,
	search: '',
	filters: [],
	titleField: 'site',
	fields: [ 'lastUpdate', 'nextUpdate', 'schedule', 'active' ],
	sort: { field: 'site', direction: 'asc' },
	groupByField: 'scheduleId',
	mediaField: 'icon.ico',
	showMedia: true,
};

export default function PluginsScheduledUpdates() {
	const [ view, setView ] = useState( defaultView );
	const navigate = useNavigate( { from: pluginsScheduledUpdatesRoute.fullPath } );
	const { data: scheduledUpdates, isLoading: isLoadingSchedules } = useQuery(
		hostingUpdateSchedulesQuery()
	);
	const { data: sites, isLoading: isLoadingSites } = useQuery( sitesQuery() );
	const mappedData = useMemo( () => {
		if ( ! scheduledUpdates || ! sites ) {
			return [];
		}
		if ( ! scheduledUpdates.sites ) {
			return [];
		}
		const updates = scheduledUpdates.sites;
		const result: ScheduledUpdateRow[] = [];

		for ( const site_id in updates ) {
			for ( const scheduleId in updates[ site_id ] ) {
				const { timestamp, schedule, interval, last_run_timestamp, active } =
					updates[ site_id ][ scheduleId ];
				const id = `${ site_id }-${ scheduleId }-${ schedule }-${ interval }`;
				const site = sites.find( ( s ) => s.ID === parseInt( site_id, 10 ) );
				if ( ! site ) {
					continue;
				}
				result.push( {
					id,
					site: site,
					lastUpdate: last_run_timestamp,
					nextUpdate: timestamp,
					active,
					schedule,
					scheduleId,
				} );
			}
		}

		// sort by schedule (daily/weekly) then timestamp
		result.sort( ( a, b ) => {
			if ( a.schedule === b.schedule ) {
				return a.nextUpdate - b.nextUpdate;
			}
			return a.schedule.localeCompare( b.schedule );
		} );
		return result;
	}, [ scheduledUpdates, sites ] );

	const { data: filtered, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( mappedData, view, fields );
	}, [ mappedData, view ] );

	const isLoading = isLoadingSchedules || isLoadingSites;
	return (
		<PageLayout
			size="large"
			header={
				<PageHeader
					title={ __( 'Scheduled updates' ) }
					actions={
						<Button
							variant="primary"
							onClick={ () => navigate( { to: pluginsScheduledUpdatesNewRoute.to } ) }
							__next40pxDefaultSize
						>
							{ __( 'New schedule' ) }
						</Button>
					}
				/>
			}
		>
			<DataViewsCard>
				<DataViews
					paginationInfo={ paginationInfo }
					fields={ fields }
					data={ filtered }
					defaultLayouts={ { table: {} } }
					view={ view }
					onChangeView={ setView }
					isLoading={ isLoading }
					empty={ __(
						"Oops! We couldn't find any schedules based on your search criteria. You might want to check your search terms and try again."
					) }
					actions={ [
						{
							id: 'edit',
							label: __( 'Edit' ),
							isPrimary: true,
							callback: () => {},
						},
						{
							id: 'remove',
							label: __( 'Remove' ),
							callback: () => {},
						},
					] }
				/>
			</DataViewsCard>
		</PageLayout>
	);
}
