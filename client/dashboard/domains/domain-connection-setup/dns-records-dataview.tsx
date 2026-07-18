import {
	DomainConnectionSetupMode,
	DomainMappingSetupInfo,
	DomainMappingStatus,
} from '@automattic/api-core';
import { Button, __experimentalText as Text } from '@wordpress/components';
import { DataViews, type Field, type ViewTable } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, arrowRight, copySmall } from '@wordpress/icons';
import { useMemo } from 'react';
import { DataViewsCard } from '../../components/dataviews';
import { useDnsRecordNames } from './hooks/use-dns-record-names';
import { matchCurrentToTargetValues } from './utils/match-records';

import './components/dns-records-table-style.scss';

const baseSuggestedView: Pick< ViewTable, 'type' | 'page' | 'perPage' > = {
	type: 'table',
	page: 1,
	perPage: 10,
};

const getSuggestedView = ( includeName: boolean ): ViewTable => {
	return {
		...baseSuggestedView,
		fields: includeName
			? [ 'name', 'currentValue', 'arrow', 'updateTo', 'copy' ]
			: [ 'currentValue', 'arrow', 'updateTo', 'copy' ],
	};
};

const viewAdvanced: ViewTable = {
	...baseSuggestedView,
	fields: [ 'type', 'name', 'currentValue', 'arrow', 'updateTo', 'copy' ],
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
	const isSubdomain = domainConnectionSetupInfo.is_subdomain;

	const { recordName, cnameRecordName } = useDnsRecordNames( {
		domainName,
		isSubdomain,
		rootDomain: domainConnectionSetupInfo.root_domain,
	} );

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
					name: recordName,
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
					name: recordName,
					...record,
				} );
			} );

			// Add CNAME record - always show it, even if not currently configured
			const currentCname = domainMappingStatus.www_cname_record_target;

			dnsRecords.push( {
				id: 'cname-record',
				type: 'CNAME',
				name: cnameRecordName,
				currentValue: currentCname || '-',
				updateTo: domainName,
			} );
		}

		return dnsRecords;
	}, [
		domainName,
		domainMappingStatus,
		domainConnectionSetupInfo,
		isSuggestedMode,
		recordName,
		cnameRecordName,
	] );

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
				label: __( 'Current value' ),
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
				label: __( 'Change to' ),
				enableHiding: false,
				enableSorting: false,
				render: ( { item } ) => {
					return <Text>{ item.updateTo }</Text>;
				},
			},
			{
				id: 'copy',
				label: '',
				enableHiding: false,
				enableSorting: false,
				header: <></>,
				render: ( { item } ) => (
					<Button
						className="dns-records-table__copy-button"
						icon={ copySmall }
						size="compact"
						aria-label={ sprintf(
							// translators: %s is a DNS record value
							__( 'Copy %s' ),
							item.updateTo
						) }
						onClick={ () => void navigator.clipboard?.writeText( item.updateTo ) }
					/>
				),
			},
		],
		[]
	);

	return (
		<DataViewsCard className="dns-records-table">
			<DataViews< DNSRecord >
				data={ records }
				fields={ fields }
				view={ isSuggestedMode ? getSuggestedView( isSubdomain ) : viewAdvanced }
				onChangeView={ () => {} }
				defaultLayouts={ { table: {} } }
				paginationInfo={ { totalItems: records.length, totalPages: 1 } }
			>
				<DataViews.Layout />
			</DataViews>
		</DataViewsCard>
	);
}
