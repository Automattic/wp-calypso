/**
 * Type definitions for markdown extensions
 */

import type { CurrencyOptions } from './charts/BaseChart';

/**
 * Base interface for all markdown extension configurations
 * All extensionshave an enabled flag and  can add specific configuration options
 * in their respective interfaces.
 */
export interface MarkdownExtensionConfigBase {
	enabled: boolean;
}

/**
 * Configuration for chart extension
 */
export interface ChartExtensionConfig extends MarkdownExtensionConfigBase {
	config?: {
		// Chart-specific options
	};
}

/**
 * Configuration for GitHub Flavored Markdown extension
 * Enables tables, strikethrough, task lists, and other GFM features
 */
export interface GfmExtensionConfig extends MarkdownExtensionConfigBase {
	config?: {
		// GFM-specific options could be added here
	};
}

/**
 * Configuration for all available markdown extensions
 */
export interface MarkdownExtensions {
	charts?: ChartExtensionConfig;
	gfm?: GfmExtensionConfig;
	// Future extensions can be added here
}

/**
 * Chart data structures as provided in JSON format
 */
export interface ChartDataPoint {
	date?: string;
	label?: string;
	value: number;
}

export interface ChartSeries {
	label: string;
	data: ChartDataPoint[];
}

export interface ChartData {
	chartType: 'line' | 'bar';
	title?: string;
	data: ChartSeries[];
	currency?: CurrencyOptions;
	mode?: 'time-comparison' | 'item-comparison';
}
