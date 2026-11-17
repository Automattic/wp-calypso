import {
	type BaseChartProps as AutomatticBaseChartProps,
	type DataPointDate,
	defaultTheme,
	type RenderTooltipParams,
	type SeriesData,
	ThemeProvider,
} from '@automattic/charts';
import React, { useMemo } from 'react';
import { getCSSVariable } from '../../utils/theme';
import { ChartError } from './ChartError';
import type { CSSProperties, FC } from 'react';

export interface CurrencyOptions {
	symbol: string;
	symbolPosition: 'left' | 'right';
}

export type ChartTooltipParams = RenderTooltipParams< DataPointDate >;

export interface BaseChartProps extends Omit< AutomatticBaseChartProps< SeriesData[] >, 'data' > {
	data: SeriesData[];
	currency?: CurrencyOptions;
	renderTooltip?: ( params: ChartTooltipParams ) => React.ReactNode;
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
export const BaseChart: FC< BaseChartInternalProps > = ( { children, error } ) => {
	// The series colors are `--a8c-charts-color-series-*` roles in `charts.css`. The first is the
	// page's primary color, which charts.css can't reach from inside `.agenttic`.
	const primaryColor = useMemo( () => getCSSVariable( '--color-primary', '#4F46E5' ), [] );

	const customTheme = useMemo( () => {
		return {
			...defaultTheme,
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
		return <ChartError message={ error.message } details={ error.details } />;
	}

	return (
		<div className="chart-block">
			<div
				className="chart-container"
				style={ { '--agenttic-chart-primary-color': primaryColor } as CSSProperties }
			>
				<ThemeProvider theme={ customTheme }>{ children }</ThemeProvider>
			</div>
		</div>
	);
};
