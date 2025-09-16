import { hostingScheduledUpdatesQuery, sitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { DataViews, type Field, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
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
		render: ( { item } ) => (
			<>
				<SiteIconLink site={ item.site } />
				{ '\u00A0' } { item.site.name }
			</>
		),
	},
];

export const defaultView: View = {
	type: 'table',
	perPage: 14,
	page: 1,
	search: '',
	filters: [],
	titleField: 'site',
	fields: [],
	sort: { field: 'site', direction: 'asc' },
	groupByField: 'schedule',
};

export default function PluginsScheduledUpdates() {
	const [ view, setView ] = useState( defaultView );
	const navigate = useNavigate( { from: pluginsScheduledUpdatesRoute.fullPath } );
	const { data: scheduledUpdates, isLoading: isLoadingSchedules } = useQuery(
		hostingScheduledUpdatesQuery()
	);
	const { data: sites, isLoading: isLoadingSites } = useQuery( sitesQuery() );

	const mappedData = useMemo( () => {
		if ( ! scheduledUpdates || ! sites ) {
			return [];
		}

		const result: ScheduledUpdateRow[] = [];

		for ( const site_id in scheduledUpdates ) {
			for ( const scheduleId in scheduledUpdates[ site_id ] ) {
				const { timestamp, schedule, interval, last_run_timestamp, active } =
					scheduledUpdates[ site_id ][ scheduleId ];
				const id = `${ site_id }-${ scheduleId }-${ schedule }-${ interval }`;
				const site = sites.find( ( s ) => s.ID === parseInt( site_id, 10 ) );
				if ( ! site ) {
					continue;
				}
				result.push( {
					id,
					site: site,
					active,
					next_run: timestamp,
					last_run: last_run_timestamp,
					schedule,
				} );
			}
		}

		// sort by schedule (daily/weekly) then timestamp
		result.sort( ( a, b ) => {
			if ( a.schedule === b.schedule ) {
				return a.next_run - b.next_run;
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
					empty={ __( 'Please create a new scheduled update.' ) }
				/>
			</DataViewsCard>
		</PageLayout>
	);
}
