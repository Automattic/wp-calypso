import { buildPageSummary } from '../../page-summary';
import type { PageSummaryMetadata } from '../shared';

export const PAGE_SUMMARY_TOOL_NAME = 'page_summary_tool';

export const pageSummaryToolDefinition = {
	type: 'function',
	name: PAGE_SUMMARY_TOOL_NAME,
	description:
		'Get the latest structured summary of the current page, including interactive elements, headings, list items, hierarchy, and viewport x/y coordinates. Use this before highlight_tool, and whenever the page may have changed.',
	parameters: {
		type: 'object',
		properties: {},
		additionalProperties: false,
	},
} as const;

interface PageSummaryToolContext {
	setPageSummaryMetadata: ( metadata: PageSummaryMetadata ) => void;
}

export function executePageSummaryTool( _rawArgs: unknown, context: PageSummaryToolContext ) {
	const summary = buildPageSummary();
	context.setPageSummaryMetadata( summary.metadata );

	return {
		ok: true,
		text: summary.text,
	};
}
