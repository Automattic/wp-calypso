import {
	Domain,
	DomainConnectionSetupMode,
	DomainMappingSetupInfo,
	DomainMappingStatus,
} from '@automattic/api-core';
import { Badge } from '@automattic/ui';
import { __experimentalText as Text } from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { DataViewsCard } from '../../../components/dataviews';
import type { Field, ViewTable } from '@wordpress/dataviews';

import './dns-records-table-style.scss';

const viewSuggested: ViewTable = {
	type: 'table',
	page: 1,
	fields: [ 'currentValue', 'expectedValue', 'status' ],
	layout: {
		enableMoving: false,
	},
};

const viewAdvanced: ViewTable = {
	...viewSuggested,
	fields: [ 'type', 'name', 'currentValue', 'expectedValue', 'status' ],
};

interface DnsRecordVerification {
	type?: string; // only present in advanced mode
	name?: string; // only present in advanced mode
	currentValue: string | null;
	expectedValue: string | null;
}

const VerificationBadge = ( { isVerified }: { isVerified: boolean } ) => {
	return (
		<Badge intent={ isVerified ? 'success' : 'warning' }>
			{ isVerified ? __( 'Verified' ) : __( 'Verifying' ) }
		</Badge>
	);
};

const fields: Field< DnsRecordVerification >[] = [
	{
		id: 'type',
		label: __( 'Type' ),
		type: 'text' as const,
		readOnly: true,
		enableHiding: false,
		enableSorting: false,
		filterBy: false,
	},
	{
		id: 'name',
		label: __( 'Name' ),
		type: 'text' as const,
		readOnly: true,
		enableHiding: false,
		enableSorting: false,
		filterBy: false,
	},
	{
		id: 'currentValue',
		label: __( 'Current Value' ),
		type: 'text' as const,
		readOnly: true,
		enableHiding: false,
		enableSorting: false,
		filterBy: false,
		render: ( { field, item } ) => field.getValue( { item } ) || '-',
	},
	{
		id: 'expectedValue',
		label: __( 'Expected Value' ),
		type: 'text' as const,
		readOnly: true,
		enableHiding: false,
		enableSorting: false,
		filterBy: false,
		render: ( { field, item } ) => <Text>{ field.getValue( { item } ) || '-' }</Text>,
	},
	{
		id: 'status',
		label: __( 'Status' ),
		type: 'text' as const,
		readOnly: true,
		enableHiding: false,
		enableSorting: false,
		filterBy: false,
		getValue: ( { item } ) => item.currentValue === item.expectedValue,
		render: ( { field, item } ) => <VerificationBadge isVerified={ field.getValue( { item } ) } />,
	},
];

const aRecordData = ( currentValue: string | null, expectedValue: string | null ) => {
	return {
		type: 'A',
		name: '@',
		currentValue: currentValue,
		expectedValue: expectedValue,
	};
};

const wwwCnameRecordData = ( currentValue: string | null, expectedValue: string | null ) => {
	return {
		type: 'CNAME',
		name: 'www',
		currentValue: currentValue,
		expectedValue: expectedValue,
	};
};

const nameServerRecordData = ( currentValue: string | null, expectedValue: string | null ) => {
	return {
		currentValue: currentValue,
		expectedValue: expectedValue,
	};
};

interface DnsRecordVerificationProps {
	domainData: Domain;
	domainConnectionStatus: DomainMappingStatus;
	domainConnectionSetupInfo: DomainMappingSetupInfo;
}

export default function DnsRecordsTable( {
	domainData,
	domainConnectionStatus,
	domainConnectionSetupInfo,
}: DnsRecordVerificationProps ) {
	const isSuggestedMode = domainConnectionStatus.mode === DomainConnectionSetupMode.SUGGESTED;

	const dnsRecords = useMemo( () => {
		const data: DnsRecordVerification[] = [];

		if ( isSuggestedMode ) {
			const currentNameServers = ( domainConnectionStatus?.name_servers || [] ).sort();
			const expectedNameServers = domainConnectionSetupInfo.wpcom_name_servers;
			const longestLength = Math.max( currentNameServers.length, expectedNameServers.length );

			for ( let i = 0; i < longestLength; i++ ) {
				data.push( nameServerRecordData( currentNameServers[ i ], expectedNameServers[ i ] ) );
			}
		} else {
			const currentIpAddresses = ( domainConnectionStatus?.host_ip_addresses || [] ).sort();
			const expectedIpAddresses = ( domainData?.a_records_required_for_mapping || [] ).sort();
			const longestLength = Math.max( currentIpAddresses.length, expectedIpAddresses.length );

			for ( let i = 0; i < longestLength; i++ ) {
				data.push( aRecordData( currentIpAddresses[ i ], expectedIpAddresses[ i ] ) );
			}

			const wwwCnameRecordTarget = domainConnectionStatus.www_cname_record_target;
			data.push( wwwCnameRecordData( wwwCnameRecordTarget, domainData.domain ) );
		}

		return data;
	}, [ domainData, domainConnectionStatus, domainConnectionSetupInfo, isSuggestedMode ] );

	return (
		<DataViewsCard className="dns-records-table">
			<DataViews< DnsRecordVerification >
				data={ dnsRecords }
				fields={ fields }
				view={ isSuggestedMode ? viewSuggested : viewAdvanced }
				defaultLayouts={ { table: {} } }
				paginationInfo={ { totalItems: dnsRecords.length, totalPages: 1 } }
				onChangeView={ () => {} }
				getItemId={ ( item: DnsRecordVerification ) =>
					`${ item.currentValue }-${ item.expectedValue }`
				}
			>
				<DataViews.Layout />
			</DataViews>
		</DataViewsCard>
	);
}
