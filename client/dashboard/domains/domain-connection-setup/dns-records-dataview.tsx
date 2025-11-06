import { DomainMappingSetupInfo, DomainMappingStatus } from '@automattic/api-core';
import { __experimentalText as Text } from '@wordpress/components';
import { DataViews, type Field, type ViewTable } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { Icon, arrowRight } from '@wordpress/icons';
import { useMemo } from 'react';
import { DataViewsCard } from '../../components/dataviews-card';

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

		// Process A records with matching logic
		const hostIpAddresses = domainMappingStatus.host_ip_addresses || [];
		const defaultIpAddresses = domainConnectionSetupInfo.default_ip_addresses || [];

		// Create a set of target IPs for easy lookup
		const targetIpSet = new Set( defaultIpAddresses );

		// Separate current IPs into matched and unmatched
		const matchedCurrentIps: string[] = [];
		const unmatchedCurrentIps: string[] = [];

		hostIpAddresses.forEach( ( ip ) => {
			if ( targetIpSet.has( ip ) ) {
				matchedCurrentIps.push( ip );
			} else {
				unmatchedCurrentIps.push( ip );
			}
		} );

		// Create A records by matching target IPs
		let unmatchedIpIndex = 0;

		defaultIpAddresses.forEach( ( targetIp, index ) => {
			let currentValue: string;

			// Check if this target IP is already in use
			if ( matchedCurrentIps.includes( targetIp ) ) {
				currentValue = targetIp;
				// Remove from matched list to handle duplicates
				matchedCurrentIps.splice( matchedCurrentIps.indexOf( targetIp ), 1 );
			} else if ( unmatchedIpIndex < unmatchedCurrentIps.length ) {
				// Use an unmatched current IP
				currentValue = unmatchedCurrentIps[ unmatchedIpIndex ];
				unmatchedIpIndex++;
			} else {
				// No more current IPs, use BLANK
				currentValue = 'BLANK';
			}

			dnsRecords.push( {
				id: `a-record-${ index }`,
				type: 'A',
				name: '@',
				currentValue,
				updateTo: targetIp,
			} );
		} );

		// Add CNAME record - always show it, even if not currently configured
		const currentCname = domainMappingStatus.www_cname_record_target;

		dnsRecords.push( {
			id: 'cname-record',
			type: 'CNAME',
			name: 'www',
			currentValue: currentCname || 'BLANK',
			updateTo: domainName,
		} );

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
				header: <></>,
				render: () => {
					return <Icon icon={ arrowRight } fill="#CCCCCC" size={ 24 } />;
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

	const view: ViewTable = {
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
	};

	return (
		<DataViewsCard>
			<DataViews< DNSRecord >
				data={ records }
				fields={ fields }
				view={ view }
				onChangeView={ () => {} }
				defaultLayouts={ { table: {} } }
				paginationInfo={ { totalItems: records.length, totalPages: 1 } }
			>
				<DataViews.Layout />
			</DataViews>
		</DataViewsCard>
	);
}
