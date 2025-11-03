import { DomainMappingSetupInfo, DomainMappingStatus } from '@automattic/api-core';
import { __experimentalText as Text } from '@wordpress/components';
import { DataViews, filterSortAndPaginate, type Field, type View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { Icon, arrowRight } from '@wordpress/icons';
import { useMemo, useState } from 'react';
import { Card } from '../../components/card';

interface DNSRecord {
	id: string;
	type: 'A' | 'CNAME';
	name: string;
	currentValue: string;
	updateTo: string;
}

interface DNSRecordsDataViewProps {
	domainName: string;
	domainMappingStatus: DomainMappingStatus;
	domainConnectionSetupInfo: DomainMappingSetupInfo;
}

export default function DNSRecordsDataView( {
	domainName,
	domainMappingStatus,
	domainConnectionSetupInfo,
}: DNSRecordsDataViewProps ) {
	// Build the DNS records data
	const records = useMemo( () => {
		const dnsRecords: DNSRecord[] = [];

		// Add A records
		const hostIpAddresses = domainMappingStatus.host_ip_addresses || [];
		const defaultIpAddresses = domainConnectionSetupInfo.default_ip_addresses || [];

		hostIpAddresses.forEach( ( currentIp, index ) => {
			// Use the corresponding default IP or the first one if there aren't enough
			const targetIp =
				index < defaultIpAddresses.length ? defaultIpAddresses[ index ] : defaultIpAddresses[ 0 ];

			if ( targetIp ) {
				dnsRecords.push( {
					id: `a-record-${ index }`,
					type: 'A',
					name: '@',
					currentValue: currentIp,
					updateTo: targetIp,
				} );
			}
		} );

		// Add CNAME record
		const currentCname = domainMappingStatus.www_cname_record_target;
		if ( currentCname ) {
			dnsRecords.push( {
				id: 'cname-record',
				type: 'CNAME',
				name: 'www',
				currentValue: currentCname,
				updateTo: `www.${ domainName }`,
			} );
		}

		return dnsRecords;
	}, [ domainName, domainMappingStatus, domainConnectionSetupInfo ] );

	const fields = useMemo< Field< DNSRecord >[] >(
		() => [
			{
				id: 'type',
				label: __( 'Type' ),
				enableHiding: false,
				enableSorting: false,
				render: ( { item } ) => {
					return <Text weight={ 500 }>{ item.type }</Text>;
				},
			},
			{
				id: 'name',
				label: __( 'Name' ),
				enableHiding: false,
				enableSorting: false,
				render: ( { item } ) => {
					return <Text variant="muted">{ item.name }</Text>;
				},
			},
			{
				id: 'currentValue',
				label: __( 'Current values' ),
				enableHiding: false,
				enableSorting: false,
				render: ( { item } ) => {
					return <Text variant="muted">{ item.currentValue }</Text>;
				},
			},
			{
				id: 'arrow',
				label: '',
				enableHiding: false,
				enableSorting: false,
				header: '',
				render: () => {
					return <Icon icon={ arrowRight } fill="#757575" size={ 24 } />;
				},
			},
			{
				id: 'updateTo',
				label: __( 'Update to' ),
				enableHiding: false,
				enableSorting: false,
				render: ( { item } ) => {
					return <Text>{ item.updateTo }</Text>;
				},
			},
		],
		[]
	);

	const [ view, setView ] = useState< View >( {
		type: 'table',
		page: 1,
		perPage: 10,
		fields: [ 'type', 'name', 'currentValue', 'arrow', 'updateTo' ],
		layout: {
			styles: {
				type: {
					width: '50px',
					maxWidth: '50px',
				},
				name: {
					width: '50px',
					maxWidth: '50px',
				},
				arrow: {
					width: '30px',
					maxWidth: '30px',
				},
			},
		},
	} );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( records, view, fields );

	return (
		<Card>
			<DataViews< DNSRecord >
				data={ filteredData ?? [] }
				fields={ fields }
				view={ view }
				onChangeView={ setView }
				paginationInfo={ paginationInfo }
				defaultLayouts={ { table: {} } }
			>
				<DataViews.Layout />
			</DataViews>
		</Card>
	);
}
