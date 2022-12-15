/* eslint-disable jsdoc/no-undefined-types */

/**
 * Return the string equivalent of a translation result. By translation result, we mean what's
 * returned by the `translate` function (which is a React element in practice).
 *
 * This is helpful when formatted text is used as both tag and attribute content. In the latter
 * case, HTML must be striped.
 *
 * @example
 * // returns Backup Daily
 * translateResultToString( translate( 'Backup {{em}}Daily{{/em}}', { components: { em: <em/> } } ) )
 * @param { TranslateResult } tr Translation returned by the `translate` function
 * @returns Translation as a string
 */
export default function translateResultToString( tr ) {
	const arr = [];

	const walkElt = ( elt ) => {
		const items = elt.props.children;

		if ( 'string' === typeof items && items.trim() ) {
			arr.push( items.trim() );
		} else if ( Array.isArray( items ) ) {
			for ( const item of items ) {
				if ( 'string' === typeof item && item.trim() ) {
					arr.push( item );
				} else if ( 'object' === typeof item && !! item?.props?.children ) {
					walkElt( item );
				}
			}
		}
	};

	if ( 'string' === typeof tr ) {
		return tr;
	}

	if ( 'object' === typeof tr && !! tr?.props?.children ) {
		walkElt( tr );
	}

	return arr.map( ( s ) => s.trim() ).join( ' ' );
}
