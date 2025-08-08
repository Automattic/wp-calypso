import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { domainDnsQuery } from '../../app/queries/domain-dns';
import { domainRoute } from '../../app/routes/domain-routes';
import DataViewsCard from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import type { DnsRecord } from '../../data/domain-dns';
import type { Field, ViewTable, ViewList, View } from '@wordpress/dataviews';

function getDnsRecordId( record: DnsRecord ) {
	return `${ record.id }-${ record.name }`;
}

type DnsView = ViewTable | ViewList;

const DEFAULT_VIEW: DnsView = {
	type: 'table',
	search: '',
	page: 1,
	perPage: 20,
	titleField: 'type',
	sort: {
		field: 'type',
		direction: 'asc',
	},
	fields: [ 'name', 'value' ],
	filters: [],
};

const DEFAULT_LAYOUTS = {
	table: {},
	list: {},
};

export default function DomainDns() {
	const { domainName } = domainRoute.useParams();
	const { data: dnsData, isLoading } = useQuery( domainDnsQuery( domainName ) );

	const fields: Field< DnsRecord >[] = useMemo(
		() => [
			{
				id: 'type',
				label: __( 'Type' ),
				enableHiding: false,
				enableSorting: true,
				getValue: ( { item } ) => item.type,
			},
			{
				id: 'name',
				label: __( 'Name' ),
				enableHiding: false,
				enableSorting: true,
				getValue: ( { item } ) => {
					const { name, service, protocol, type } = item;

					if ( 'SRV' === type ) {
						return `${ service }.${ protocol }.${
							name.replace( /\.$/, '' ) === domainName ? name : name + '.' + domainName + '.'
						}`;
					}

					if ( name.replace( /\.$/, '' ) === domainName ) {
						return '@';
					}

					return name;
				},
			},
			{
				id: 'value',
				label: __( 'Value' ),
				enableHiding: false,
				enableSorting: true,
				getValue: ( { item } ) => {
					// For SRV records, construct the full value
					if ( item.type === 'SRV' ) {
						return `${ item.weight || 0 } ${ item.port || 0 } ${ item.target || '' }`;
					}

					// For other records, use target or data property
					return item.target || item.data || '';
				},
			},
		],
		[ domainName ]
	);

	const [ view, setView ] = useState< DnsView >( DEFAULT_VIEW );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate(
		dnsData?.records ?? [],
		view,
		fields
	);

	return (
		<PageLayout
			size="small"
			header={
				<VStack>
					<PageHeader
						title={ __( 'DNS Records' ) }
						actions={ <Button variant="primary">{ __( 'Add DNS Record' ) }</Button> }
					/>
				</VStack>
			}
		>
			<DataViewsCard>
				{ dnsData?.records?.length === 0 && ! isLoading ? (
					<div style={ { padding: '20px', textAlign: 'center' } }>
						{ __( 'No DNS records found for this domain.' ) }
					</div>
				) : (
					<DataViews< DnsRecord >
						data={ filteredData || [] }
						fields={ fields }
						onChangeView={ ( view: View ) => setView( view as DnsView ) }
						search={ false }
						view={ view }
						paginationInfo={ paginationInfo }
						getItemId={ getDnsRecordId }
						isLoading={ isLoading }
						defaultLayouts={ DEFAULT_LAYOUTS }
					>
						<>
							<DataViews.Layout />
						</>
					</DataViews>
				) }
			</DataViewsCard>
		</PageLayout>
	);
}
