import { domainMappingStatusQuery, domainQuery } from '@automattic/api-queries';
import { Badge } from '@automattic/ui';
import { useSuspenseQuery } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { DataViewsCard } from '../../../components/dataviews-card';
import type { Field, ViewTable, View } from '@wordpress/dataviews';

import './dns-records-table-style.scss';

interface FormData {
	type: string;
	name: string;
	currentValue: string;
	expectedValue: string;
	status: React.ReactNode;
}

const DEFAULT_VIEW: ViewTable = {
	type: 'table',
	page: 1,
	sort: {
		field: 'type',
		direction: 'asc',
	},
	fields: [ 'type', 'name', 'currentValue', 'expectedValue', 'status' ],
};

const fields: Field< FormData >[] = [
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

export default function DnsRecordsTable( { domainName }: { domainName: string } ) {
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: domainMappingStatus } = useSuspenseQuery( domainMappingStatusQuery( domainName ) );

	const formData = useMemo( (): FormData[] => {
		const data: FormData[] = [];

		const hostIpAddresses = ( domainMappingStatus?.host_ip_addresses || [] ).sort();
		const expectedIpAddresses = ( domain?.a_records_required_for_mapping || [] ).sort();
		const longestArray = Math.max( hostIpAddresses.length, expectedIpAddresses.length );

		for ( let i = 0; i < longestArray; i++ ) {
			const isVerified = hostIpAddresses[ i ] === expectedIpAddresses[ i ];

			data.push( {
				type: 'A',
				name: '@',
				currentValue: hostIpAddresses[ i ] || '-',
				expectedValue: expectedIpAddresses[ i ] || '-',
				status: isVerified ? <VerifiedBadge /> : <VerifyingBadge />,
			} );
		}

		if ( domainMappingStatus.www_cname_record_target ) {
			const isVerified = domainMappingStatus.www_cname_record_target === domainName;

			data.push( {
				type: 'CNAME',
				name: 'www',
				currentValue: domainMappingStatus.www_cname_record_target,
				expectedValue: domainName,
				status: isVerified ? <VerifiedBadge /> : <VerifyingBadge />,
			} );
		}

		return data;
	}, [ domain, domainName, domainMappingStatus ] );

	const [ view, setView ] = useState< ViewTable >( DEFAULT_VIEW );

	const { data: filteredData, paginationInfo } = useMemo(
		() => filterSortAndPaginate( formData, view, fields ),
		[ formData, view ]
	);

	return (
		<DataViewsCard className="update-dns-records-table">
			<DataViews< FormData >
				data={ filteredData }
				fields={ fields }
				view={ view }
				defaultLayouts={ { table: {} } }
				paginationInfo={ paginationInfo }
				onChangeView={ ( view: View ) => setView( view as ViewTable ) }
				getItemId={ ( item: FormData ) =>
					`${ item.type }-${ item.name }-${ item.currentValue }-${ item.expectedValue }`
				}
			>
				<>
					<DataViews.Layout />
					<DataViews.Pagination />
				</>
			</DataViews>
		</DataViewsCard>
	);
}
