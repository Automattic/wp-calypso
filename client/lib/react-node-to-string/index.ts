import { ReactNode, ReactElement, isValidElement } from 'react';

/**
 * Return the string equivalent of a React node. This is helpful when formatted text is used as
 * both tag and attribute content. In the latter case, HTML must be stripped. In the example
 * below, `translate` returns a React node.
 * @example
 * // returns Backup Daily
 * reactNodeToString( translate( 'Backup {{em}}Daily{{/em}}', { components: { em: <em/> } } ) )
 * @param { ReactNode } node Node to extract the string from.
 * @returns String equivalent.
 */
export default function reactNodeToString( node: ReactNode ): string {
	const arr: string[] = [];

	const walkElt = ( elt: ReactElement ) => {
		const items = elt.props.children;

		if ( 'string' === typeof items && items.trim() ) {
			arr.push( items.trim() );
		} else if ( 'number' === typeof items ) {
			arr.push( `${ node }` );
		} else if ( Array.isArray( items ) ) {
			for ( const item of items ) {
				if ( 'string' === typeof item && item.trim() ) {
					arr.push( item );
				} else if ( 'number' === typeof node ) {
					arr.push( `${ node }` );
				} else if ( isValidElement( item ) ) {
					walkElt( item );
				}
			}
		}
	};

	if ( 'string' === typeof node ) {
		return node;
	}

	if ( 'number' === typeof node ) {
		arr.push( `${ node }` );
	}

	if ( isValidElement( node ) ) {
		walkElt( node );
	}

	return arr.map( ( s ) => s.trim() ).join( ' ' );
}
