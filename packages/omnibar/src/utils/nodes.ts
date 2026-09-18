import type { OmnibarNode, OmnibarNodeTransformer, OmnibarNodes } from '../types';

/**
 * Applies `transform` to every node in the tree, including nested children, and
 * returns a new `OmnibarNodes` — so callers don't have to know which sections
 * hold a single node and which hold a list.
 */
export function transformOmnibarNodes(
	nodes: OmnibarNodes,
	transform: OmnibarNodeTransformer
): OmnibarNodes {
	const transformNode = ( node: OmnibarNode ): OmnibarNode => {
		const transformed = transform( node );
		return transformed.children
			? { ...transformed, children: transformed.children.map( transformNode ) }
			: transformed;
	};

	const entries = Object.entries( nodes ).map( ( [ section, value ] ) => {
		if ( Array.isArray( value ) ) {
			return [ section, value.map( transformNode ) ];
		}
		return [ section, value && transformNode( value ) ];
	} );

	return Object.fromEntries( entries ) as OmnibarNodes;
}
