/**
 * Read / Write MCP tools pages — group tools by display group (AIINT-469/472):
 * Content Authoring, Site, Account, etc. A group defaults to a STRAP facade, but
 * some facades are merged into another group (e.g. Create Site into Site). Each
 * settings-visible ability carries a `group` field matching the `name` of one of
 * the ordered group descriptors returned by the API (`mcp_abilities.groups`, see
 * utils.js `getGroupDescriptors()`).
 */

import { __ } from '@wordpress/i18n';

/**
 * @param {Array<[string, import('@automattic/api-core').McpAbility]>} tools
 * @param {Array<{name: string, label: string, description: string, order: number}>} groupDescriptors Ordered group descriptors.
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

	const orderedDescriptors = [ ...groupDescriptors ].sort( ( a, b ) => a.order - b.order );

	const groups = [];
	for ( const descriptor of orderedDescriptors ) {
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
