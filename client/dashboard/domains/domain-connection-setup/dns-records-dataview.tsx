import {
	DomainConnectionSetupMode,
	DomainMappingSetupInfo,
	DomainMappingStatus,
} from '@automattic/api-core';
import { __experimentalText as Text } from '@wordpress/components';
import { DataViews, type Field, type ViewTable } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { Icon, arrowRight } from '@wordpress/icons';
import { useMemo } from 'react';
import { DataViewsCard } from '../../components/dataviews-card';
import { matchCurrentToTargetValues } from './utils/match-records';

const viewSuggested: ViewTable = {
	type: 'table',
	page: 1,
	perPage: 10,
	fields: [ 'currentValue', 'arrow', 'updateTo' ],
	layout: {
		styles: {
			arrow: {
				width: '30px',
				maxWidth: '30px',
			},
		},
	},
};

const viewAdvanced: ViewTable = {
	...viewSuggested,
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

interface DNSRecord {
	id: string;
	type?: 'A' | 'CNAME';
	name?: string;
	currentValue: string;
	updateTo: string;
}

interface DNSRecordsDataViewProps {
	domainName: string;
	domainMappingStatus: DomainMappingStatus;
	domainConnectionSetupInfo: DomainMappingSetupInfo;
	mode: typeof DomainConnectionSetupMode.SUGGESTED | typeof DomainConnectionSetupMode.ADVANCED;
}

export default function DNSRecordsDataView( {
	domainName,
	domainMappingStatus,
	domainConnectionSetupInfo,
	mode,
}: DNSRecordsDataViewProps ) {
	const isSuggestedMode = mode === DomainConnectionSetupMode.SUGGESTED;

	// Build the DNS records data
	const records = useMemo( () => {
		const dnsRecords: DNSRecord[] = [];

		if ( isSuggestedMode ) {
			// Process nameserver records for suggested mode
			const currentNameservers = domainMappingStatus.name_servers || [];
			const targetNameservers = domainConnectionSetupInfo.wpcom_name_servers || [];

			const matchedRecords = matchCurrentToTargetValues( currentNameservers, targetNameservers );

			matchedRecords.forEach( ( record, index ) => {
				dnsRecords.push( {
					id: `ns-record-${ index }`,
					...record,
				} );
			} );
		} else {
			// Process A records with matching logic for advanced mode
			const hostIpAddresses = domainMappingStatus.host_ip_addresses || [];
			const defaultIpAddresses = domainConnectionSetupInfo.default_ip_addresses || [];

			const matchedIps = matchCurrentToTargetValues( hostIpAddresses, defaultIpAddresses );

			matchedIps.forEach( ( record, index ) => {
				dnsRecords.push( {
					id: `a-record-${ index }`,
					type: 'A',
					name: '@',
					...record,
				} );
			} );

			// Add CNAME record - always show it, even if not currently configured
			const currentCname = domainMappingStatus.www_cname_record_target;

			dnsRecords.push( {
				id: 'cname-record',
				type: 'CNAME',
				name: 'www',
				currentValue: currentCname || '-',
				updateTo: domainName,
			} );
		}

		return dnsRecords;
	}, [ domainName, domainMappingStatus, domainConnectionSetupInfo, isSuggestedMode ] );

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

	return (
		<DataViewsCard>
			<DataViews< DNSRecord >
				data={ records }
				fields={ fields }
				view={ isSuggestedMode ? viewSuggested : viewAdvanced }
				onChangeView={ () => {} }
				defaultLayouts={ { table: {} } }
				paginationInfo={ { totalItems: records.length, totalPages: 1 } }
			>
				<DataViews.Layout />
			</DataViews>
		</DataViewsCard>
	);
}
