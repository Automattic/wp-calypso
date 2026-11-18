import {
	type BaseChartProps as AutomatticBaseChartProps,
	type DataPointDate,
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

	if ( error ) {
		return <ChartError message={ error.message } details={ error.details } />;
	}

	return (
		<div className="chart-block">
			<div
				className="chart-container"
				style={ { '--agenttic-chart-primary-color': primaryColor } as CSSProperties }
			>
				<ThemeProvider>{ children }</ThemeProvider>
			</div>
		</div>
	);
};
