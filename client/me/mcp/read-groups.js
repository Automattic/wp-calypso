/**
 * Read / Write MCP tools pages — group tools the same way as Dashboard MCP settings
 * (`client/dashboard/me/mcp/categories.ts`): Sites & Content, Account, Billing, etc.
 */

import {
	CATEGORY_ORDER,
	SUB_CATEGORY_ORDER,
	getDisplayCategory,
	getSubCategory,
	sortTools,
} from '../../dashboard/me/mcp/categories';

export { CATEGORY_ORDER, SUB_CATEGORY_ORDER, getSubCategory, sortTools };

/**
 * @param {Array<[string, import('@automattic/api-core').McpAbility]>} tools
 * @returns {Record<string, Array<[string, import('@automattic/api-core').McpAbility]>>}
 */
export function groupToolsByDisplayCategory( tools ) {
	/** @type {Record<string, Array<[string, import('@automattic/api-core').McpAbility]>>} */
	const grouped = {};
	for ( const entry of tools ) {
		const [ toolId, ability ] = entry;
		const category = getDisplayCategory( toolId, ability );
		if ( ! grouped[ category ] ) {
			grouped[ category ] = [];
		}
		grouped[ category ].push( entry );
	}
	return grouped;
}
