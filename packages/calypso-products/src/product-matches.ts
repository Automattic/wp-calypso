import { getProductFromSlug } from '.';

interface Query {
	term?: string;
	type?: string;
}

/**
 * Matches plan specified by `productSlug` against `query`.
 * Only compares `type` and `term` properties.
 *
 * For example:
 *
 * > productMatches( TYPE_BUSINESS, { term: TERM_ANNUALLY, type: TYPE_BUSINESS } );
 * true
 *
 * > productMatches( TYPE_BUSINESS, { term: TERM_BIENNIALLY } );
 * false
 *
 * @param {string} productSlug product to match
 * @param {object} query Properties that should match
 * @returns {boolean} Does `productSlug` match?
 */
export function productMatches( productSlug: string, query: Query = {} ): boolean {
	const acceptedKeys = [ 'type', 'term' ];
	const unknownKeys = Object.keys( query ).filter( ( key ) => ! acceptedKeys.includes( key ) );
	if ( unknownKeys.length ) {
		throw new Error(
			`productMatches can only match against ${ acceptedKeys.join( ',' ) }, ` +
				`but unknown keys ${ unknownKeys.join( ',' ) } were passed.`
		);
	}

	// @TODO: make getPlan() throw an error on failure. This is going to be a larger change with a separate PR.
	const plan = getProductFromSlug( productSlug ) || {};
	const match = ( key ) => ! ( key in query ) || plan[ key ] === query[ key ];
	return match( 'type' ) && match( 'term' );
}
