import { useNavigate } from '@tanstack/react-router';
import { Button, FormToggle } from '@wordpress/components';
import { DataViews, type Field, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { format, fromUnixTime } from 'date-fns';
import { useMemo, useState } from 'react';
import {
	pluginsScheduledUpdatesNewRoute,
	pluginsScheduledUpdatesRoute,
} from '../../app/router/plugins';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SiteIconLink } from '../../sites/site-fields';
import { useScheduledUpdates } from './hooks/use-scheduled-updates';
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

	const { isLoading, scheduledUpdates } = useScheduledUpdates();
	const { data: filtered, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( scheduledUpdates, view, fields );
	}, [ scheduledUpdates, view ] );

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
