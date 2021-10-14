import { getProductFromSlug } from './get-product-from-slug';

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
 * > productMatches( PRODUCT_JETPACK_BACKUP_DAILY, { term: TERM_ANNUALLY, type: PRODUCT_JETPACK_BACKUP_DAILY } );
 * true
 *
 * > productMatches( PRODUCT_JETPACK_BACKUP_DAILY, { term: TERM_BIENNIALLY } );
 * false
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
