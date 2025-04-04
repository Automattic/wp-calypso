// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
import {
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useLoaderData } from 'react-router-dom';
import { Domain, fetchDomains } from '../data';

const fields = [
	{
		id: 'domain_name',
		label: __( 'Domains' ),
		enableHiding: false,
		enableSorting: true,
		enableGlobalSearch: true,
		getValue: ( { item }: { item: Domain } ) => item.domain,
	},
	{
		id: 'domain_type',
		label: __( 'Domain type' ),
		enableHiding: false,
		enableSorting: false,
	},
	{
		id: 'owner',
		label: __( 'Owner' ),
		enableHiding: false,
		enableSorting: true,
	},
	{
		id: 'site',
		label: __( 'Site' ),
		enableHiding: false,
		enableSorting: true,
		// getValue: ( { item }: { item: Domain } ) => sites[ item.blog_id ]?.name ?? '',
	},
	{
		id: 'ssl_status',
		label: __( 'SSL' ),
		enableHiding: false,
		enableSorting: true,
	},
	{
		id: 'expiry',
		label: __( 'Expires/Renews on' ),
		enableHiding: false,
		enableSorting: true,
		getValue: ( { item }: { item: Domain } ) => ( item.expiry ? Date.parse( item.expiry ) : 0 ),
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
		field: 'domain_name',
		direction: 'asc',
	},
	page: 1,
	perPage: 10,
	search: '',
	type: 'table',
	showMedia: false,
	titleField: 'domain_name',
	descriptionField: 'domain_type',
	fields: [
		'domain_name',
		'domain_type',
		'owner',
		'site',
		'ssl_status',
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
	const domains = useLoaderData() as Domain[];
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( domains, view, fields );
	return (
		<VStack spacing={ 4 }>
			<Heading level={ 2 }>{ __( 'Domains' ) }</Heading>
			<div className="domains-dataviews">
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
			</div>
		</VStack>
	);
}

// For future use with React Router
Domains.loader = fetchDomains;

export default Domains;
