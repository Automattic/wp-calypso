/**
 * Type definitions for markdown extensions
 */

import type { DataPointDate } from '@automattic/charts';
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

// Example of how future extensions would be added:
// export interface TableExtensionConfig extends MarkdownExtensionConfigBase {
//     config?: {
//         sortable?: boolean;
//         pageSize?: number;
//     };
// }

/**
 * Configuration for all available markdown extensions
 */
export interface MarkdownExtensions {
	charts?: ChartExtensionConfig;
	// Future extensions can be added here
}

export interface ChartSeries {
	label: string;
	data: DataPointDate[];
}

export interface ChartData {
	chartType: 'line' | 'bar';
	title?: string;
	data: ChartSeries[];
	currency?: CurrencyOptions;
	mode?: 'time-comparison' | 'item-comparison';
}
