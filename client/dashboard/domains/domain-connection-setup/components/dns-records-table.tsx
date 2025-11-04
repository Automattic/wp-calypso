import { DomainConnectionSetupMode, DomainMappingSetupInfo } from '@automattic/api-core';
import { domainMappingStatusQuery, domainQuery } from '@automattic/api-queries';
import { Badge } from '@automattic/ui';
import { useSuspenseQuery } from '@tanstack/react-query';
import { DataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { DataViewsCard } from '../../../components/dataviews-card';
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
	type: 'table',
	page: 1,
	fields: [ 'type', 'name', 'currentValue', 'expectedValue', 'status' ],
	layout: {
		enableMoving: false,
	},
};

interface DnsRecordSuggestedVerification {
	currentValue: string;
	expectedValue: string;
	status: React.ReactNode;
}

interface DnsRecordAdvancedVerification {
	type: string;
	name: string;
	currentValue: string;
	expectedValue: string;
	status: React.ReactNode;
}

const fieldsSuggested: Field< DnsRecordSuggestedVerification >[] = [
	{
		id: 'currentValue',
		label: __( 'Current Value' ),
		type: 'text' as const,
		readOnly: true,
		enableHiding: false,
		enableSorting: false,
		filterBy: false,
	},
	{
		id: 'expectedValue',
		label: __( 'Expected Value' ),
		type: 'text' as const,
		readOnly: true,
		enableHiding: false,
		enableSorting: false,
		filterBy: false,
	},
	{
		id: 'status',
		label: __( 'Status' ),
		type: 'text' as const,
		readOnly: true,
		enableHiding: false,
		enableSorting: false,
		filterBy: false,
	},
];

const fieldsAdvanced: Field< DnsRecordAdvancedVerification >[] = [
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
	},
	{
		id: 'expectedValue',
		label: __( 'Expected Value' ),
		type: 'text' as const,
		readOnly: true,
		enableHiding: false,
		enableSorting: false,
		filterBy: false,
	},
	{
		id: 'status',
		label: __( 'Status' ),
		type: 'text' as const,
		readOnly: true,
		enableHiding: false,
		enableSorting: false,
		filterBy: false,
	},
];

const VerifiedBadge = () => {
	return <Badge intent="success">{ __( 'Verified' ) }</Badge>;
};

const VerifyingBadge = () => {
	return <Badge intent="warning">{ __( 'Verifying' ) }</Badge>;
};

const aRecordData = ( currentValue: string, expectedValue: string ) => {
	return {
		type: 'A',
		name: '@',
		currentValue: currentValue,
		expectedValue: expectedValue,
		status: currentValue === expectedValue ? <VerifiedBadge /> : <VerifyingBadge />,
	};
};

const wwwCnameRecordData = ( currentValue: string, expectedValue: string ) => {
	return {
		type: 'CNAME',
		name: 'www',
		currentValue: currentValue,
		expectedValue: expectedValue,
		status: currentValue === expectedValue ? <VerifiedBadge /> : <VerifyingBadge />,
	};
};

const nameServerRecordData = ( currentValue: string, expectedValue: string ) => {
	return {
		currentValue: currentValue,
		expectedValue: expectedValue,
		status: currentValue === expectedValue ? <VerifiedBadge /> : <VerifyingBadge />,
	};
};

export default function DnsRecordsTable( {
	domainName,
	domainConnectionSetupInfo,
}: {
	domainName: string;
	domainConnectionSetupInfo: DomainMappingSetupInfo;
} ) {
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: domainMappingStatus } = useSuspenseQuery( domainMappingStatusQuery( domainName ) );

	const isSuggestedMode = domainMappingStatus.mode === DomainConnectionSetupMode.SUGGESTED;

	const dnsRecords = useMemo( (): (
		| DnsRecordAdvancedVerification
		| DnsRecordSuggestedVerification
	)[] => {
		const data: ( DnsRecordAdvancedVerification | DnsRecordSuggestedVerification )[] = [];

		if ( isSuggestedMode ) {
			const currentNameServers = ( domainMappingStatus?.name_servers || [] ).sort();
			const expectedNameServers = domainConnectionSetupInfo.wpcom_name_servers;
			const longestLength = Math.max( currentNameServers.length, expectedNameServers.length );

			for ( let i = 0; i < longestLength; i++ ) {
				data.push(
					nameServerRecordData( currentNameServers[ i ] || '-', expectedNameServers[ i ] || '-' )
				);
			}
		} else {
			const currentIpAddresses = ( domainMappingStatus?.host_ip_addresses || [] ).sort();
			const expectedIpAddresses = ( domain?.a_records_required_for_mapping || [] ).sort();
			const longestLength = Math.max( currentIpAddresses.length, expectedIpAddresses.length );

			for ( let i = 0; i < longestLength; i++ ) {
				data.push( aRecordData( currentIpAddresses[ i ] || '-', expectedIpAddresses[ i ] || '-' ) );
			}

			const wwwCnameRecordTarget = domainMappingStatus.www_cname_record_target || '-';
			data.push( wwwCnameRecordData( wwwCnameRecordTarget, domainName ) );
		}

		return data;
	}, [ domain, domainName, domainMappingStatus, isSuggestedMode ] );

	return (
		<DataViewsCard className="dns-records-table">
			{ isSuggestedMode ? (
				<DataViews< DnsRecordSuggestedVerification >
					data={ dnsRecords as DnsRecordSuggestedVerification[] }
					fields={ fieldsSuggested }
					view={ viewSuggested }
					defaultLayouts={ { table: {} } }
					paginationInfo={ { totalItems: dnsRecords.length, totalPages: 1 } }
					onChangeView={ () => {} }
					getItemId={ ( item: DnsRecordSuggestedVerification ) =>
						`${ item.currentValue }-${ item.expectedValue }`
					}
				>
					<DataViews.Layout />
				</DataViews>
			) : (
				<DataViews< DnsRecordAdvancedVerification >
					data={ dnsRecords as DnsRecordAdvancedVerification[] }
					fields={ fieldsAdvanced }
					view={ viewAdvanced }
					defaultLayouts={ { table: {} } }
					paginationInfo={ { totalItems: dnsRecords.length, totalPages: 1 } }
					onChangeView={ () => {} }
					getItemId={ ( item: DnsRecordAdvancedVerification ) =>
						`${ item.type }-${ item.name }-${ item.currentValue }`
					}
				>
					<DataViews.Layout />
				</DataViews>
			) }
		</DataViewsCard>
	);
}
