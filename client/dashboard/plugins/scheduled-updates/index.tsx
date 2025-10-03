import { useLocale } from '@automattic/i18n-utils';
import { FormToggle } from '@wordpress/components';
import { DataViews, type Field, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { pluginsScheduledUpdatesNewRoute } from '../../app/router/plugins';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { SiteIconLink } from '../../sites/site-fields';
import { formatDate } from '../../utils/datetime';
import { useScheduledUpdates } from './hooks/use-scheduled-updates';
import { ScheduledUpdateRow } from './types';

const getFields = ( locale: string ): Field< ScheduledUpdateRow >[] => [
	{
		id: 'site',
		type: 'text',
		label: __( 'Site' ),
		getValue: ( { item } ) => item.site.name,
	},
	{
		id: 'lastUpdate',
		type: 'integer',
		label: __( 'Last Update' ),
		render: ( { item } ) =>
			item.lastUpdate
				? formatDate( new Date( item.lastUpdate * 1000 ), locale, {
						dateStyle: 'medium',
						timeStyle: 'short',
				  } )
				: '-',
	},
	{
		id: 'nextUpdate',
		type: 'integer',
		label: __( 'Next Update' ),
		render: ( { item } ) =>
			formatDate( new Date( item.nextUpdate * 1000 ), locale, {
				dateStyle: 'medium',
				timeStyle: 'short',
			} ),
	},
	{
		id: 'schedule',
		type: 'text',
		label: __( 'Frequency' ),
		render: ( { item } ) => ( item.schedule === 'daily' ? __( 'Daily' ) : __( 'Weekly' ) ),
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
		type: 'text',
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
	const locale = useLocale();

	const fields = useMemo( () => getFields( locale ), [ locale ] );

	const { isLoading, scheduledUpdates } = useScheduledUpdates();
	const { data: filtered, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( scheduledUpdates, view, fields );
	}, [ scheduledUpdates, view, fields ] );

	return (
		<PageLayout
			size="large"
			header={
				<PageHeader
					title={ __( 'Scheduled updates' ) }
					actions={
						<RouterLinkButton
							variant="primary"
							to={ pluginsScheduledUpdatesNewRoute.to }
							__next40pxDefaultSize
						>
							{ __( 'New schedule' ) }
						</RouterLinkButton>
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
					empty={
						<p>
							{ scheduledUpdates.length === 0
								? __( 'No scheduled updates yet.' )
								: __(
										'We couldn’t find any schedules based on your search criteria. You might want to check your search terms and try again.'
								  ) }
						</p>
					}
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
