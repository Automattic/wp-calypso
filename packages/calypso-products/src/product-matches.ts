import { getProductFromSlug } from '.';

/**
 * Matches plan specified by `planKey` against `query`.
 * Only compares `type`, `group`, and `term` properties.
 *
 * For example:
 *
 * > planMatches( TYPE_BUSINESS, { term: TERM_ANNUALLY, group: GROUP_WPCOM, type: TYPE_BUSINESS } );
 * true
 *
 * > planMatches( TYPE_BUSINESS, { term: TERM_BIENNIALLY } );
 * false
 *
 * @param {string|object} planKey Plan to match
 * @param {object} query Properties that should match
 * @returns {boolean} Does `planKey` match?
 */
export function productMatches( productSlug, query = {} ) {
	const acceptedKeys = [ 'type', 'group', 'term' ];
	const unknownKeys = Object.keys( query ).filter( ( key ) => ! acceptedKeys.includes( key ) );
	if ( unknownKeys.length ) {
		throw new Error(
			`planMatches can only match against ${ acceptedKeys.join( ',' ) }, ` +
				`but unknown keys ${ unknownKeys.join( ',' ) } were passed.`
		);
	}

	// @TODO: make getPlan() throw an error on failure. This is going to be a larger change with a separate PR.
	const plan = getProductFromSlug( productSlug ) || {};
	const match = ( key ) => ! ( key in query ) || plan[ key ] === query[ key ];
	return match( 'type' ) && match( 'group' ) && match( 'term' );
}
