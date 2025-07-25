/**
 * Markdown Extensions Processor
 *
 * This module handles the processing of markdown extensions for agenttic-client.
 * It provides a centralized way to register and process different types of
 * markdown extensions like charts, tables, forms, etc.
 */

import type { Components } from 'react-markdown';
import { createChartBlock } from './charts';
import type { MarkdownExtensions } from './types';

/**
 * Process markdown extensions and return components for react-markdown
 * @param extensions - The markdown extensions configuration
 * @return An object containing react-markdown components for the enabled extensions
 */
export function processMarkdownExtensions(
	extensions?: MarkdownExtensions
): Components {
	const components: Components = {};

	if ( extensions?.charts?.enabled ) {
		components.code = createChartBlock( extensions.charts.config );
	}

	// Future extensions can be processed here

	return components;
}

/**
 * Merge extension components with user-provided markdown components
 * User components take precedence over extension components
 * @param extensionComponents - Components from extensions
 * @param userComponents      - User-provided components
 * @return Merged components object
 */
export function mergeMarkdownComponents(
	extensionComponents: Components,
	userComponents: Components = {}
): Components {
	return {
		...extensionComponents,
		...userComponents,
	};
}

// Re-export types for convenience
export type { DataPointDate } from '@automattic/charts';
export type {
	ChartData,
	ChartExtensionConfig,
	ChartSeries,
	MarkdownExtensionConfigBase,
	MarkdownExtensions,
} from './types';
