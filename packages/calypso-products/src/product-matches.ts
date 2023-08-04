import { getProductFromSlug } from './get-product-from-slug';
import type { ProductSlug } from './types';

export interface Query {
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
export function productMatches( productSlug: ProductSlug, query: Query = {} ): boolean {
	const acceptedKeys = [ 'type', 'term' ];
	const unknownKeys = Object.keys( query ).filter( ( key ) => ! acceptedKeys.includes( key ) );
	if ( unknownKeys.length ) {
		throw new Error(
			`productMatches can only match against ${ acceptedKeys.join( ',' ) }, ` +
				`but unknown keys ${ unknownKeys.join( ',' ) } were passed.`
		);
	}

	const planFromSlug = getProductFromSlug( productSlug );
	const plan = typeof planFromSlug === 'string' ? { term: '', type: '' } : planFromSlug;
	return (
		( query.term ? plan.term === query.term : true ) &&
		( query.type ? plan.type === query.type : true )
	);
}
