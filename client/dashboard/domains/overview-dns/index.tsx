import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { domainDnsQuery } from '../../app/queries/domain-dns';
import { domainRoute } from '../../app/routes/domain-routes';
import DataViewsCard from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { useDnsActions } from './actions';
import DnsActionsMenu from './dns-actions-menu';
import type { DnsRecord } from '../../data/domain-dns';
import type { Field, ViewTable, ViewList, View } from '@wordpress/dataviews';

function getDnsRecordId( record: DnsRecord ) {
	return `${ record.id }-${ record.name }`;
}

const trimDot = ( str?: string ) => {
	return str ? str.replace( /\.$/, '' ) : '';
};

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

	const hasDefaultARecords =
		dnsData?.records?.some( ( record ) => record?.type === 'A' && record?.protected_field ) ?? true;

	const actions = useDnsActions();

	const fields: Field< DnsRecord >[] = [
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
				const { type, aux, port, weight } = item;
				const data = trimDot( item.data );
				const target = '.' !== item.target ? trimDot( item.target ) : '.';
				if ( item.protected_field ) {
					if ( 'MX' === type ) {
						return __( 'Mail handled by WordPress.com email forwarding' );
					}
					return __( 'Handled by WordPress.com' );
				}

				switch ( type ) {
					case 'MX':
						return sprintf(
							// translators: %(data)s is a hostname, %(aux)d is a priority
							__( '%(data)s with priority %(aux)d' ),
							{
								data,
								aux: aux as number,
							}
						);
					case 'SRV':
						return sprintf(
							// translators: %(target)s is a hostname, %(port)d is a port, %(aux)d is a priority, %(weight)d is a weight
							__( '%(target)s:%(port)d, with priority %(aux)d and weight %(weight)d' ),
							{
								target,
								port: port as number,
								aux: aux as number,
								weight: weight as number,
							}
						);
				}
				return data;
			},
			render: ( { field, item } ) => (
				<div style={ { whiteSpace: 'pre-wrap', wordBreak: 'break-word' } }>
					{ field.getValue( { item } ) }
				</div>
			),
		},
	];

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
						actions={
							<>
								<Button variant="primary">{ __( 'Add DNS Record' ) }</Button>
								<DnsActionsMenu
									hasDefaultARecords={ ! hasDefaultARecords }
									hasDefaultCnameRecord={ false }
									hasDefaultEmailRecords={ false }
								/>
							</>
						}
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
						actions={ actions }
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
