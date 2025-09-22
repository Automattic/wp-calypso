import { Badge } from '@automattic/ui';
import {
	Icon,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useFormattedTime } from '../../../components/formatted-time';
import { formatYmd } from '../../../utils/datetime';
import { SeverityBadge, getSeverityLabel } from '../../scan/severity-badge';
import { getThreatIcon, sortSeverity } from '../../scan/utils';
import type { Threat } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

const FormattedTime = ( { timestamp }: { timestamp: string } ) => {
	const formattedTime = useFormattedTime( timestamp, {
		dateStyle: 'medium',
		timeStyle: 'short',
	} );
	return <>{ formattedTime }</>;
};

const getStatusLabel = ( status: string ): string => {
	switch ( status ) {
		case 'fixed':
			return __( 'Fixed' );
		case 'ignored':
			return __( 'Ignored' );
		default:
			return status;
	}
};

const getStatusIntent = ( status: string ): 'default' | 'success' | 'warning' => {
	switch ( status ) {
		case 'fixed':
			return 'success';
		case 'ignored':
			return 'warning';
		default:
			return 'default';
	}
};

export function getFields(): Field< Threat >[] {
	return [
		{
			id: 'status',
			label: __( 'Status' ),
			filterBy: {
				operators: [ 'isAny' ],
			},
			elements: [
				{ value: 'fixed', label: __( 'Fixed' ) },
				{ value: 'ignored', label: __( 'Ignored' ) },
			],
			getValue: ( { item } ) => item.status,
			render: ( { item } ) => {
				return (
					<HStack spacing={ 2 } justify="flex-start" wrap>
						<Badge intent={ getStatusIntent( item.status ) }>
							{ getStatusLabel( item.status ) }
						</Badge>
					</HStack>
				);
			},
		},
		{
			id: 'fixed_on',
			label: __( 'Resolved On' ),
			type: 'date',
			filterBy: {
				operators: [ 'on', 'before', 'after' ],
			},
			getValue: ( { item } ) => {
				if ( ! item.fixed_on ) {
					return '';
				}
				const date = new Date( item.fixed_on );
				return formatYmd( date );
			},
			render: ( { item } ) =>
				item.fixed_on ? <FormattedTime timestamp={ item.fixed_on } /> : <Text>—</Text>,
		},
		{
			id: 'threat',
			label: __( 'Details' ),
			getValue: ( { item } ) => item.title,
			render: ( { item } ) => (
				<HStack spacing={ 2 } justify="flex-start" wrap>
					<Icon
						className="site-scan-threats__type-icon"
						icon={ getThreatIcon( item ) }
						size={ 24 }
					/>
					<Text>{ item.title }</Text>
				</HStack>
			),
			enableGlobalSearch: true,
		},
		{
			id: 'severity',
			label: __( 'Severity' ),
			filterBy: {
				operators: [ 'isAny' ],
			},
			elements: [
				{ value: 'Critical', label: __( 'Critical' ) },
				{ value: 'High', label: __( 'High' ) },
				{ value: 'Low', label: __( 'Low' ) },
			],
			getValue: ( { item } ) => getSeverityLabel( item.severity ),
			render: ( { item } ) => <SeverityBadge severity={ item.severity } />,
			sort: sortSeverity,
		},
	];
}
