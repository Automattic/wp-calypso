import { DomainMappingSetupInfo, DomainMappingStatus } from '@automattic/api-core';
import { __experimentalText as Text } from '@wordpress/components';
import { DataViews, type Field, type ViewTable } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { Icon, arrowRight } from '@wordpress/icons';
import { useMemo } from 'react';
import { Card } from '../../components/card';

interface NameserverRecord {
	id: string;
	currentValue: string;
	updateTo: string;
}

interface NameserversDataViewProps {
	domainMappingStatus: DomainMappingStatus;
	domainConnectionSetupInfo: DomainMappingSetupInfo;
}

export default function NameserversDataView( {
	domainMappingStatus,
	domainConnectionSetupInfo,
}: NameserversDataViewProps ) {
	// Build the nameserver records data
	const records = useMemo( () => {
		const currentNameservers = domainMappingStatus.name_servers || [];
		const targetNameservers = domainConnectionSetupInfo.wpcom_name_servers || [];
		const nameserverRecords: NameserverRecord[] = [];

		// Create a set of target nameservers for easy lookup
		const targetSet = new Set( targetNameservers );

		// Separate current nameservers into matched and unmatched
		const matchedCurrent: string[] = [];
		const unmatchedCurrent: string[] = [];

		currentNameservers.forEach( ( ns ) => {
			if ( targetSet.has( ns ) ) {
				matchedCurrent.push( ns );
			} else {
				unmatchedCurrent.push( ns );
			}
		} );

		// Create records by matching target nameservers
		let unmatchedIndex = 0;

		targetNameservers.forEach( ( targetNs, index ) => {
			let currentValue: string;

			// Check if this target nameserver is already in use
			if ( matchedCurrent.includes( targetNs ) ) {
				currentValue = targetNs;
				// Remove from matched list to handle duplicates
				matchedCurrent.splice( matchedCurrent.indexOf( targetNs ), 1 );
			} else if ( unmatchedIndex < unmatchedCurrent.length ) {
				// Use an unmatched current nameserver
				currentValue = unmatchedCurrent[ unmatchedIndex ];
				unmatchedIndex++;
			} else {
				// No more current nameservers, use BLANK
				currentValue = 'BLANK';
			}

			nameserverRecords.push( {
				id: `ns-record-${ index }`,
				currentValue,
				updateTo: targetNs,
			} );
		} );

		return nameserverRecords;
	}, [ domainMappingStatus, domainConnectionSetupInfo ] );

	const fields = useMemo< Field< NameserverRecord >[] >(
		() => [
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

	return (
		<Card>
			<DataViews< NameserverRecord >
				data={ records }
				fields={ fields }
				view={ view }
				onChangeView={ () => {} }
				paginationInfo={ { totalItems: records.length, totalPages: 1 } }
				defaultLayouts={ { table: {} } }
			>
				<DataViews.Layout />
			</DataViews>
		</Card>
	);
}
