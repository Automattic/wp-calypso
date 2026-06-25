/**
 * Read / Write MCP tools pages — group tools by display group (AIINT-469/472):
 * Content Authoring, Site, Account, etc. A group's members usually come from one
 * STRAP facade, but multiple facades can resolve to the same group (e.g. Create
 * Site into Site), and standalone abilities can declare a group directly in
 * config. Each settings-visible ability carries a `group` field (a clean slug,
 * e.g. `site`) matching the `name` of one of the ordered group descriptors
 * returned by the API (`mcp_abilities.groups`, see utils.js `getGroupDescriptors()`).
 */

import { __ } from '@wordpress/i18n';
import { SUB_CATEGORY_ORDER, getSubCategory } from '../../dashboard/me/mcp/categories';

// Flat priority list of all known sub-categories across all display categories.
// Used to order sub-groups within an expanded group card consistently.
const FLAT_SUB_CATEGORY_ORDER = [ ...new Set( Object.values( SUB_CATEGORY_ORDER ).flat() ) ];

/**
 * @param {Array<[string, import('@automattic/api-core').McpAbility]>} tools
 * @param {Array<{name: string, label: string, description: string, order: number}>} groupDescriptors Group descriptors, already ordered (e.g. via `getGroupDescriptors()`).
 * @returns {Array<{group: {name: string, label: string, description: string, order: number}|null, label: string, tools: Array<[string, import('@automattic/api-core').McpAbility]>}>}
 */
export function groupToolsByGroup( tools, groupDescriptors ) {
	const byGroupName = new Map();
	const unmatched = [];

	for ( const entry of tools ) {
		const [ , ability ] = entry;
		const groupName = ability?.group ?? null;
		if ( groupName === null ) {
			unmatched.push( entry );
			continue;
		}
		if ( ! byGroupName.has( groupName ) ) {
			byGroupName.set( groupName, [] );
		}
		byGroupName.get( groupName ).push( entry );
	}

	const groups = [];
	for ( const descriptor of groupDescriptors ) {
		const groupTools = byGroupName.get( descriptor.name );
		if ( groupTools && groupTools.length > 0 ) {
			groups.push( { group: descriptor, label: descriptor.label, tools: groupTools } );
		}
		byGroupName.delete( descriptor.name );
	}

	// Abilities whose `group` doesn't match any known descriptor (unexpected, but
	// don't silently drop them) join the unmatched/no-group fallback bucket.
	for ( const groupTools of byGroupName.values() ) {
		unmatched.push( ...groupTools );
	}

	if ( unmatched.length > 0 ) {
		groups.push( {
			group: null,
			label: __( 'Other', 'calypso' ),
			tools: unmatched,
		} );
	}

	return groups;
}

/**
 * Sub-group a set of tools by their API `category` field (same signal trunk uses
 * for intra-card dividers), ordered by FLAT_SUB_CATEGORY_ORDER.
 * Tools with no sub-category land in a trailing bucket with `subCategory: null`.
 * Returns a single-element array when all tools share the same sub-category (or none).
 *
 * @param {Array<[string, import('@automattic/api-core').McpAbility]>} tools
 * @returns {Array<{subCategory: string|null, tools: Array<[string, import('@automattic/api-core').McpAbility]>}>}
 */
export function groupToolsBySubCategory( tools ) {
	const bySubCategory = new Map();

	for ( const entry of tools ) {
		const [ toolId, ability ] = entry;
		const sub = getSubCategory( toolId, ability ) ?? null;
		if ( ! bySubCategory.has( sub ) ) {
			bySubCategory.set( sub, [] );
		}
		bySubCategory.get( sub ).push( entry );
	}

	const result = [];

	for ( const sub of FLAT_SUB_CATEGORY_ORDER ) {
		if ( bySubCategory.has( sub ) ) {
			result.push( { subCategory: sub, tools: bySubCategory.get( sub ) } );
			bySubCategory.delete( sub );
		}
	}

	// Any sub-categories not in the known order (future-proofing)
	for ( const [ sub, subTools ] of bySubCategory ) {
		if ( sub !== null ) {
			result.push( { subCategory: sub, tools: subTools } );
		}
	}

	// Tools with no resolved sub-category at the end
	if ( bySubCategory.has( null ) ) {
		result.push( { subCategory: null, tools: bySubCategory.get( null ) } );
	}

	return result;
}
