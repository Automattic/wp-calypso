import {
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
import { useDnsRecordNames } from '../hooks/use-dns-record-names';
import type { Field, ViewTable } from '@wordpress/dataviews';

import './dns-records-table-style.scss';

const baseSuggestedView: ViewTable = {
	type: 'table',
	page: 1,
	fields: [],
	layout: {
		enableMoving: false,
	},
};

const getSuggestedView = ( includeName: boolean ): ViewTable => {
	return {
		...baseSuggestedView,
		fields: includeName
			? [ 'name', 'currentValue', 'expectedValue', 'status' ]
			: [ 'currentValue', 'expectedValue', 'status' ],
	};
};

const viewAdvanced: ViewTable = {
	...baseSuggestedView,
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

const aRecordData = ( currentValue: string | null, expectedValue: string | null, name: string ) => {
	return {
		type: 'A',
		name,
		currentValue: currentValue,
		expectedValue: expectedValue,
	};
};

const wwwCnameRecordData = (
	currentValue: string | null,
	expectedValue: string | null,
	name: string
) => {
	return {
		type: 'CNAME',
		name,
		currentValue: currentValue,
		expectedValue: expectedValue,
	};
};

const nameServerRecordData = (
	currentValue: string | null,
	expectedValue: string | null,
	name?: string
) => {
	return {
		name,
		currentValue: currentValue,
		expectedValue: expectedValue,
	};
};

interface DnsRecordVerificationProps {
	domainName: string;
	domainConnectionStatus: DomainMappingStatus;
	domainConnectionSetupInfo: DomainMappingSetupInfo;
}

export default function DnsRecordsTable( {
	domainName,
	domainConnectionStatus,
	domainConnectionSetupInfo,
}: DnsRecordVerificationProps ) {
	const isSuggestedMode = domainConnectionStatus.mode === DomainConnectionSetupMode.SUGGESTED;
	const isSubdomain = domainConnectionSetupInfo.is_subdomain;

	const { recordName, cnameRecordName } = useDnsRecordNames( {
		domainName,
		isSubdomain,
		rootDomain: domainConnectionSetupInfo.root_domain,
	} );

	const dnsRecords = useMemo( () => {
		const data: DnsRecordVerification[] = [];

		if ( isSuggestedMode ) {
			const currentNameServers = ( domainConnectionStatus?.name_servers || [] ).sort();
			const expectedNameServers = domainConnectionSetupInfo.wpcom_name_servers;
			const longestLength = Math.max( currentNameServers.length, expectedNameServers.length );

			for ( let i = 0; i < longestLength; i++ ) {
				data.push(
					nameServerRecordData(
						currentNameServers[ i ],
						expectedNameServers[ i ],
						isSubdomain ? recordName : undefined
					)
				);
			}
		} else {
			const currentIpAddresses = ( domainConnectionStatus?.host_ip_addresses || [] ).sort();
			const expectedIpAddresses = ( domainConnectionSetupInfo.default_ip_addresses || [] ).sort();
			const longestLength = Math.max( currentIpAddresses.length, expectedIpAddresses.length );

			for ( let i = 0; i < longestLength; i++ ) {
				data.push( aRecordData( currentIpAddresses[ i ], expectedIpAddresses[ i ], recordName ) );
			}

			const wwwCnameRecordTarget = domainConnectionStatus.www_cname_record_target;
			data.push( wwwCnameRecordData( wwwCnameRecordTarget, domainName, cnameRecordName ) );
		}

		return data;
	}, [
		domainName,
		domainConnectionStatus,
		domainConnectionSetupInfo,
		isSuggestedMode,
		isSubdomain,
		recordName,
		cnameRecordName,
	] );

	return (
		<DataViewsCard className="dns-records-table">
			<DataViews< DnsRecordVerification >
				data={ dnsRecords }
				fields={ fields }
				view={ isSuggestedMode ? getSuggestedView( isSubdomain ) : viewAdvanced }
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
