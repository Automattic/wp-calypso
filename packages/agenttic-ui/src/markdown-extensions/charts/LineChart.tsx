/**
 * External dependencies
 */
import { LineChart as AutomatticLineChart } from '@automattic/charts';
import type { FC } from 'react';
import React from 'react';

/**
 * Internal dependencies
 */
import type { BaseChartProps } from './BaseChart';
import { BaseChart } from './BaseChart';
import { getDefaultChartMargins, getTimeAxisConfig } from './utils/chartUtils';

export interface LineChartProps extends BaseChartProps {
	withGradientFill?: boolean;
	withLegendGlyph?: boolean;
	withStartGlyphs?: boolean;
	glyphStyle?: React.SVGProps< SVGCircleElement >;
}

/**
 * Line chart component for time-series data
 * @param props Component props
 */
export const LineChart: FC< LineChartProps > = ( props ) => {
	const {
		data,
		currency,
		showLegend = true,
		withTooltips = true,
		renderTooltip,
		margin: defaultMargin,
		withGradientFill = true,
		withLegendGlyph = true,
		withStartGlyphs = false,
		glyphStyle = {
			r: 4,
			strokeWidth: 2,
			fillOpacity: 1,
			pointerEvents: 'all',
			cursor: 'pointer',
		},
		error,
		...restProps
	} = props;

	const margin = getDefaultChartMargins( defaultMargin );

	const chartProps = {
		data,
		withTooltips,
		renderTooltip,
		showLegend,
		withGradientFill,
		withLegendGlyph,
		withStartGlyphs,
		glyphStyle,
		legendOrientation: 'horizontal' as const,
		legendAlignmentHorizontal: 'center' as const,
		legendAlignmentVertical: 'bottom' as const,
		margin,
		options: {
			xScale: {
				type: 'time' as const,
			},
			axis: {
				x: {
					...getTimeAxisConfig( data ),
				},
			},
		},
		...( currency && { currency } ),
		...restProps,
	};

	return (
		<BaseChart error={ error }>
			<AutomatticLineChart { ...chartProps } />
		</BaseChart>
	);
};
