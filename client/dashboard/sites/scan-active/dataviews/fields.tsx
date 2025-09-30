import {
	Icon,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { FormattedTime } from '../../../components/formatted-time';
import { formatYmd } from '../../../utils/datetime';
import { SeverityBadge, getSeverityLabel } from '../../scan/severity-badge';
import { getThreatIcon, sortSeverity } from '../../scan/utils';
import type { Threat } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

export function getFields( timezoneString?: string, gmtOffset?: number ): Field< Threat >[] {
	return [
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
		{
			id: 'threat',
			label: __( 'Threat' ),
			getValue: ( { item } ) => item.title,
			render: ( { item } ) => (
				<HStack spacing={ 2 } justify="flex-start">
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
			id: 'first_detected',
			label: __( 'Detected on' ),
			type: 'date',
			filterBy: {
				operators: [ 'on', 'before', 'after' ],
			},
			getValue: ( { item } ) => {
				const date = new Date( item.first_detected );
				return formatYmd( date );
			},
			render: ( { item } ) => (
				<FormattedTime
					timestamp={ item.first_detected }
					timezoneString={ timezoneString }
					gmtOffset={ gmtOffset }
				/>
			),
		},
		{
			id: 'auto_fix',
			label: __( 'Auto-fix' ),
			filterBy: {
				operators: [ 'isAny' ],
			},
			elements: [
				{ value: 'available', label: __( 'Auto-fix available' ) },
				{ value: 'unavailable', label: __( 'No auto-fix available' ) },
			],
			getValue: ( { item } ) => ( item.fixable ? 'available' : 'unavailable' ),
			render: ( { item } ) =>
				item.fixable ? (
					<Icon
						icon={ check }
						size={ 24 }
						style={ { fill: 'var(--dashboard__background-color-success)' } }
						aria-label={ __( 'Auto-fix available' ) }
					/>
				) : null,
		},
	];
}
