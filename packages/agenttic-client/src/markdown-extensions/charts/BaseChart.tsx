/**
 * External dependencies
 */
import {
	type BaseChartProps as AutomatticBaseChartProps,
	type DataPointDate,
	defaultTheme,
	type SeriesData,
	ThemeProvider,
} from '@automattic/charts';
import type { RenderTooltipParams } from '@visx/xychart/lib/components/Tooltip';
import type { FC } from 'react';
import React, { useMemo } from 'react';

/**
 * Internal dependencies
 */
import { getCSSVariable } from '../../utils/theme';
import { ChartError } from './ChartError';

export interface CurrencyOptions {
	symbol: string;
	symbolPosition: 'left' | 'right';
}

export interface BaseChartProps
	extends Omit< AutomatticBaseChartProps< SeriesData[] >, 'data' > {
	data: SeriesData[];
	currency?: CurrencyOptions;
	renderTooltip?: (
		params: RenderTooltipParams< DataPointDate >
	) => React.ReactNode;
	error?: {
		message: string;
		details?: string;
	} | null;
}

export type { SeriesData } from '@automattic/charts';

interface BaseChartInternalProps {
	children: React.ReactNode;
	error?: {
		message: string;
		details?: string;
	} | null;
}

/**
 * Base chart component with shared logic for all chart types
 * @param root0
 * @param root0.children
 * @param root0.error
 */
export const BaseChart: FC< BaseChartInternalProps > = ( {
	children,
	error,
} ) => {
	const customTheme = useMemo( () => {
		const primaryColor = getCSSVariable( '--color-accent', '#4F46E5' );

		// TODO: Decide what other colors to include here
		const colors = [ primaryColor, '#f0b849', '#00a32a', '#8c5e94' ];

		return {
			...defaultTheme,
			colors,
			legendLabelStyles: {
				fontSize: '11px',
				fontWeight: '400',
				lineHeight: '1.2',
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
			},
			legendItemStyles: {
				padding: '2px 0',
				display: 'flex',
				alignItems: 'center',
			},
			legendGlyphSize: 12,
		};
	}, [] );

	if ( error ) {
		return (
			<ChartError message={ error.message } details={ error.details } />
		);
	}

	return (
		<div className="chart-block">
			<div className="chart-container">
				<ThemeProvider theme={ customTheme }>
					{ children }
				</ThemeProvider>
			</div>
		</div>
	);
};
