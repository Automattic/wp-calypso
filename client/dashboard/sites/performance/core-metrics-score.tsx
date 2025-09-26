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

const getValueText = ( metric: Metrics, status: string, value: number ) => (
	<Text color={ getColorForStatus( status ) } size={ 32 }>
		{ displayValue( metric, value ) }
	</Text>
);

export function OverallScore( {
	metric,
	status,
	value,
}: {
	metric: Metrics;
	status: string;
	value: number;
} ) {
	return (
		<HStack spacing={ 1 } justify="flex-start" alignment="baseline">
			{ getValueText( metric, status, value ) }
			<Text size={ 12 } variant="muted">
				/ 100
			</Text>
		</HStack>
	);
}

export function MetricScore( {
	metric,
	status,
	value,
}: {
	metric: Metrics;
	status: string;
	value: number;
} ) {
	return (
		<Text size={ 20 } variant="muted">
			{ getValueText( metric, status, value ) }
		</Text>
	);
}
