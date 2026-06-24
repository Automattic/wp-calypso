/**
 * Read / Write MCP tools pages — group tools by STRAP facade (AIINT-469/472):
 * Content Authoring, Site, Account, etc. Each settings-visible ability carries a
 * `strap` field matching the `name` of one of the ordered facade descriptors
 * returned by the API (`mcp_abilities.straps`, see utils.js `getStrapDescriptors()`).
 */

import { __ } from '@wordpress/i18n';

/**
 * @param {Array<[string, import('@automattic/api-core').McpAbility]>} tools
 * @param {Array<{name: string, label: string, order: number}>} straps Ordered STRAP descriptors.
 * @returns {Array<{strap: {name: string, label: string, order: number}|null, label: string, tools: Array<[string, import('@automattic/api-core').McpAbility]>}>}
 */
export function groupToolsByStrap( tools, straps ) {
	const byStrapName = new Map();
	const unmatched = [];

	for ( const entry of tools ) {
		const [ , ability ] = entry;
		const strapName = ability?.strap ?? null;
		if ( strapName === null ) {
			unmatched.push( entry );
			continue;
		}
		if ( ! byStrapName.has( strapName ) ) {
			byStrapName.set( strapName, [] );
		}
		byStrapName.get( strapName ).push( entry );
	}

	const orderedStraps = [ ...straps ].sort( ( a, b ) => a.order - b.order );

	const groups = [];
	for ( const descriptor of orderedStraps ) {
		const groupTools = byStrapName.get( descriptor.name );
		if ( groupTools && groupTools.length > 0 ) {
			groups.push( { strap: descriptor, label: descriptor.label, tools: groupTools } );
		}
		byStrapName.delete( descriptor.name );
	}

	// Abilities whose `strap` doesn't match any known descriptor (unexpected, but
	// don't silently drop them) join the unmatched/no-strap fallback bucket.
	for ( const groupTools of byStrapName.values() ) {
		unmatched.push( ...groupTools );
	}

	if ( unmatched.length > 0 ) {
		groups.push( {
			strap: null,
			label: __( 'Other', 'calypso' ),
			tools: unmatched,
		} );
	}

	return groups;
}
