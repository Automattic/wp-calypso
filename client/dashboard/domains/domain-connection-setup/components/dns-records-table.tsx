import { domainMappingStatusQuery, domainQuery } from '@automattic/api-queries';
import { Badge } from '@automattic/ui';
import { useSuspenseQuery } from '@tanstack/react-query';
import { DataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { DataViewsCard } from '../../../components/dataviews-card';
import type { Field, ViewTable } from '@wordpress/dataviews';

import './dns-records-table-style.scss';

const view: ViewTable = {
	type: 'table',
	page: 1,
	fields: [ 'type', 'name', 'currentValue', 'expectedValue', 'status' ],
};

interface DnsRecordVerification {
	type: string;
	name: string;
	currentValue: string;
	expectedValue: string;
	status: React.ReactNode;
}

const fields: Field< DnsRecordVerification >[] = [
	{
		id: 'type',
		label: __( 'Type' ),
		type: 'text' as const,
		readOnly: true,
	},
	{
		id: 'name',
		label: __( 'Name' ),
		type: 'text' as const,
		readOnly: true,
	},
	{
		id: 'currentValue',
		label: __( 'Current Value' ),
		type: 'text' as const,
		readOnly: true,
	},
	{
		id: 'expectedValue',
		label: __( 'Expected Value' ),
		type: 'text' as const,
		readOnly: true,
	},
	{
		id: 'status',
		label: __( 'Status' ),
		type: 'text' as const,
		readOnly: true,
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

export default function DnsRecordsTable( { domainName }: { domainName: string } ) {
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: domainMappingStatus } = useSuspenseQuery( domainMappingStatusQuery( domainName ) );

	const dnsRecords = useMemo( (): DnsRecordVerification[] => {
		const data: DnsRecordVerification[] = [];

		const currentIpAddresses = ( domainMappingStatus?.host_ip_addresses || [] ).sort();
		const expectedIpAddresses = ( domain?.a_records_required_for_mapping || [] ).sort();

		for ( let i = 0; i < Math.max( currentIpAddresses.length, expectedIpAddresses.length ); i++ ) {
			data.push( aRecordData( currentIpAddresses[ i ], expectedIpAddresses[ i ] ) );
		}

		const wwwCnameRecordTarget = domainMappingStatus.www_cname_record_target || '-';
		data.push( wwwCnameRecordData( wwwCnameRecordTarget, domainName ) );

		return data;
	}, [ domain, domainName, domainMappingStatus ] );

	return (
		<DataViewsCard className="dns-records-table">
			<DataViews< DnsRecordVerification >
				data={ dnsRecords }
				fields={ fields }
				view={ view }
				defaultLayouts={ { table: {} } }
				paginationInfo={ { totalItems: dnsRecords.length, totalPages: 1 } }
				onChangeView={ () => {} }
				getItemId={ ( item: DnsRecordVerification ) =>
					`${ item.type }-${ item.name }-${ item.currentValue }`
				}
			>
				<DataViews.Layout />
			</DataViews>
		</DataViewsCard>
	);
}
