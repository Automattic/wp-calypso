import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { DataViews, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { dateI18n } from '@wordpress/date';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { domainsQuery } from '../app/queries';
import DataViewsCard from '../dataviews-card';
import PageLayout from '../page-layout';
import type { Domain } from '../data/types';

const fields = [
	{
		id: 'domain',
		label: __( 'Domains' ),
		enableHiding: false,
		enableSorting: true,
		enableGlobalSearch: true,
		getValue: ( { item }: { item: Domain } ) => item.domain,
	},
	{
		id: 'type',
		label: __( 'Type' ),
		enableHiding: false,
		enableSorting: false,
	},
	// {
	// 	id: 'owner',
	// 	label: __( 'Owner' ),
	// 	enableHiding: false,
	// 	enableSorting: true,
	// },
	{
		id: 'blog_name',
		label: __( 'Site' ),
		enableHiding: false,
		enableSorting: true,
		getValue: ( { item }: { item: Domain } ) => item.blog_name ?? '',
	},
	// {
	// 	id: 'ssl_status',
	// 	label: __( 'SSL' ),
	// 	enableHiding: false,
	// 	enableSorting: true,
	// },
	{
		id: 'expiry',
		label: __( 'Expires/Renews on' ),
		enableHiding: false,
		enableSorting: true,
		getValue: ( { item }: { item: Domain } ) => dateI18n( 'F j, Y', item.expiry ),
	},
	{
		id: 'domain_status',
		label: __( 'Status' ),
		enableHiding: false,
		enableSorting: true,
		getValue: ( { item }: { item: Domain } ) => item.domain_status?.status,
	},
];

const initialViewState: View = {
	filters: [],
	sort: {
		field: 'domain',
		direction: 'asc',
	},
	page: 1,
	perPage: 10,
	search: '',
	type: 'table',
	showMedia: false,
	titleField: 'domain',
	// descriptionField: 'domain_type',
	fields: [
		'type',
		// 'owner',
		'blog_name',
		// 'ssl_status',
		'expiry',
		'domain_status',
	],
};

// Default layouts
const defaultLayouts = {
	table: {},
};

function getDomainId( domain: Domain ): string {
	return `${ domain.domain }-${ domain.blog_id }`;
}

function Domains() {
	const [ view, setView ] = useState( () => initialViewState );
	const domains = useQuery( domainsQuery() ).data;
	if ( ! domains ) {
		return;
	}
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( domains, view, fields );
	return (
		<PageLayout
			title={ __( 'Domains' ) }
			actions={
				<Button variant="primary" __next40pxDefaultSize>
					{ __( 'Add New Domain' ) }
				</Button>
			}
		>
			<DataViewsCard>
				<DataViews
					data={ filteredData || [] }
					fields={ fields }
					onChangeView={ ( newView ) => setView( () => newView ) }
					view={ view }
					actions={ [] }
					search
					paginationInfo={ paginationInfo }
					getItemId={ getDomainId }
					isLoading={ false }
					defaultLayouts={ defaultLayouts }
				/>
			</DataViewsCard>
		</PageLayout>
	);
}

export default Domains;
