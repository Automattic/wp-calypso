import { Metrics } from '@automattic/api-core';
import { Text } from '../../components/text';
import { getColorForStatus, getDisplayValue, Valuation } from '../../utils/site-performance';

const getValueText = ( {
	metric,
	status,
	value,
	size,
	lineHeight,
}: {
	metric: Metrics;
	status: Valuation;
	value: number;
	size: number;
	lineHeight: string;
} ) => (
	<Text
		align="end"
		color={ getColorForStatus( status ) }
		size={ size }
		weight={ 500 }
		lineHeight={ lineHeight }
	>
		{ getDisplayValue( metric, value ) }
	</Text>
);

export function MetricScore( {
	lineHeight = 'inherit',
	metric,
	status,
	size = 20,
	value,
}: {
	lineHeight?: string;
	metric: Metrics;
	status: Valuation;
	size?: number;
	value: number;
} ) {
	return getValueText( { metric, status, value, size, lineHeight } );
}
