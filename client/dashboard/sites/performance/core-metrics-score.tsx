import { Metrics } from '@automattic/api-core';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { Text } from '../../components/text';
import { getColorForStatus, Valuation } from '../../utils/site-performance';

const max2Decimals = ( val: number ) => +Number( val ).toFixed( 2 );

const getDisplayValue = ( metric: Metrics, value: number ): string => {
	if ( value === null || value === undefined ) {
		return '';
	}

	if ( metric === 'overall_score' ) {
		return `${ Math.floor( value ) }`;
	}

	if ( [ 'lcp', 'fcp', 'ttfb', 'inp', 'tbt' ].includes( metric ) ) {
		return `${ max2Decimals( value / 1000 ) }s`;
	}

	return `${ max2Decimals( value ) }`;
};

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

export function OverallScore( {
	lineHeight = 'inherit',
	status,
	size = 20,
	value,
}: {
	lineHeight?: string;
	status: Valuation;
	size?: number;
	value: number;
} ) {
	const formattedValue = value * 100;

	return (
		<HStack spacing={ 1 } justify="flex-start">
			{ getValueText( {
				metric: 'overall_score',
				status,
				value: formattedValue,
				size,
				lineHeight,
			} ) }
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
	status: Valuation;
	size?: number;
	value: number;
} ) {
	return getValueText( { metric, status, value, size, lineHeight } );
}
