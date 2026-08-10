/**
 * External dependencies
 */
import { BarChart as AutomatticBarChart } from '@automattic/charts';
import type { FC } from 'react';

/**
 * Internal dependencies
 */
import type { BaseChartProps } from './BaseChart';
import { BaseChart } from './BaseChart';
import {
	calculateBottomMargin,
	getDefaultChartMargins,
	getTimeAxisConfig,
} from './utils/chartUtils';

export interface BarChartProps extends BaseChartProps {
	mode?: 'time-comparison' | 'item-comparison';
	truncateLabels?: boolean;
	maxLabelLength?: number;
}

/**
 * Bar chart component for comparisons and time-series data
 * @param props Component props
 */
export const BarChart: FC< BarChartProps > = ( props ) => {
	const {
		data,
		currency,
		showLegend = true,
		withTooltips = true,
		renderTooltip,
		margin: defaultMargin,
		mode = 'time-comparison',
		truncateLabels = true,
		maxLabelLength = 15,
		error,
		...restProps
	} = props;

	const truncateText = ( text: string, maxLength: number ) => {
		if ( ! truncateLabels || text.length <= maxLength ) {
			return text;
		}
		return text.substring( 0, maxLength - 3 ) + '...';
	};

	const calculateBarChartBottomMargin = () => {
		if ( mode === 'item-comparison' && data && data.length > 0 ) {
			let longestLabel = '';

			data.forEach( ( series ) => {
				if ( series?.data ) {
					series.data.forEach( ( item ) => {
						const label = item.label || '';
						const truncated = truncateText( label, maxLabelLength );
						if ( truncated.length > longestLabel.length ) {
							longestLabel = truncated;
						}
					} );
				}
			} );

			return calculateBottomMargin( 80, 6, 25, longestLabel.length );
		}

		return calculateBottomMargin();
	};

	const margin = {
		...getDefaultChartMargins( defaultMargin ),
		bottom: calculateBarChartBottomMargin(),
	};

	const getAxisConfig = () => {
		if ( mode === 'item-comparison' ) {
			return {
				xScale: {
					type: 'band' as const,
					padding: 0.2,
				},
				axis: {
					x: {
						orientation: 'bottom' as const,
						tickFormat: ( value: string ) =>
							truncateText( value, maxLabelLength ),
						tickLabelProps: {
							fontSize: 11,
							textAnchor: 'end' as const,
							angle: -90,
							dx: 0,
							dy: -5,
						},
					},
				},
			};
		}

		return {
			xScale: { type: 'time' as const },
			axis: {
				x: {
					...getTimeAxisConfig( data ),
					dy: -15,
				},
			},
		};
	};

	const axisConfig = getAxisConfig();

	const chartProps = {
		data,
		withTooltips,
		renderTooltip,
		showLegend,
		legendOrientation: 'horizontal' as const,
		legendAlignmentHorizontal: 'center' as const,
		legendAlignmentVertical: 'bottom' as const,
		margin,
		// TODO: Fix this inconsistency that seems to be in @automattic/charts
		// Item-comparison mode requires axis config wrapped in 'options' prop
		// Time-comparison mode requires axis config spread directly
		...( mode === 'item-comparison'
			? { options: axisConfig }
			: axisConfig ),
		...( currency && { currency } ),
		...restProps,
	};

	return (
		<BaseChart error={ error }>
			<AutomatticBarChart { ...chartProps } />
		</BaseChart>
	);
};
