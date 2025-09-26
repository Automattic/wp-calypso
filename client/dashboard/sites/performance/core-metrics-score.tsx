import { __experimentalText as Text, __experimentalHStack as HStack } from '@wordpress/components';
import { displayValue } from './utils';
import { Metrics } from './core-metrics';

const getColorForStatus = ( status: string ): string => {
	if ( status === 'bad' ) {
		return '#CC1818';
	}
	if ( status === 'needsImprovement' ) {
		return '#B36100';
	}
	return '#21873B';
};

const getValueText = ( { metric, status, value, size, lineHeight }: {
	metric: Metrics;
	status: string;
	value: number;
	size: number;
	lineHeight: string;
} ) => (
	<Text color={ getColorForStatus( status ) } size={ size } weight={ 500 } lineHeight={ lineHeight }>
		{ displayValue( metric, value ) }
	</Text>
);

export function OverallScore( {
	lineHeight = 'inherit',
	metric,
	status,
	size = 20,
	value,
}: {
	lineHeight?: string;
	metric: Metrics;
	status: string;
	size?: number;
	value: number;
} ) {
	return (
		<HStack spacing={ 1 } justify="flex-start" alignment="baseline">
			{ getValueText( { metric, status, value, size, lineHeight } ) }
			<Text size={ 12 } variant="muted">
				/ 100
			</Text>
		</HStack>
	);
}

export function MetricScore( {
	lineHeight = 'inherit',
	metric,
	status,
	size = 20,
	value,
}: {
	lineHeight?: string;
	metric: Metrics;
	status: string;
	size?: number;
	value: number;
} ) {
	return getValueText( { metric, status, value, size, lineHeight } );
}
