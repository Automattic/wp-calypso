/**
 * Chart extension for markdown processing
 */
import React from 'react';
import type { ChartExtensionConfig } from '../types';
import { ChartBlock } from './ChartBlock';

interface CodeProps extends React.HTMLAttributes< HTMLElement > {
	children?: React.ReactNode;
	className?: string;
}

type ChartConfig = ChartExtensionConfig[ 'config' ];

/**
 * Create a chart block component that handles code blocks with language="chart"
 * @param config - Optional configuration for the chart extension
 * @return A react-markdown code component that renders charts
 */
export function createChartBlock( config?: ChartConfig ) {
	return function ChartCodeBlock( props: CodeProps ) {
		const { children, className, ...rest } = props;

		const isChartBlock = className?.includes( 'language-chart' );

		if ( ! isChartBlock ) {
			return React.createElement(
				'code',
				{ className, ...rest },
				children
			);
		}

		const chartData = typeof children === 'string' ? children : '';

		return React.createElement( ChartBlock, {
			data: chartData,
			className: 'markdown-chart',
			config,
		} );
	};
}

// Export chart components
export { BarChart } from './BarChart';
export { BaseChart } from './BaseChart';
export { ChartBlock } from './ChartBlock';
export { ChartError } from './ChartError';
export { ChartErrorBoundary } from './ChartErrorBoundary';
export { LineChart } from './LineChart';

// Export types
export type { BarChartProps } from './BarChart';
export type { BaseChartProps, CurrencyOptions, SeriesData } from './BaseChart';
export type { ChartBlockProps } from './ChartBlock';
export type { LineChartProps } from './LineChart';
