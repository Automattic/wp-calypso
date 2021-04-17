/**
 * Internal dependencies
 */
import { getDomainProductRanking, isCredits, isDomainProduct, isPlan } from '.';

// https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore
const groupBy = ( items, key ) =>
	items.reduce(
		( r, v, i, a, k = v[ key ] ) => ( ( r[ k ] || ( r[ k ] = [] ) ).push( v ), r ),
		{}
	);

/**
 * Sorts all products in the following order:
 *
 * 1. Plan
 * 2. Domain Cart Items. Included in plans come first.
 *   a. Domain Registration
 *   b. Domain Mapping
 *   c. Privacy Protection
 * 3. Other Cart Items
 * 4. Credits Cart Item
 *
 * @param {object[]} products
 *
 * @returns {object[]} the sorted list of items in the shopping cart
 */

function sortProducts( products ) {
	let domainItems;

	const planItems = products.filter( isPlan );

	const includedItems = products.filter( isIncludedWithPlan );

	domainItems = products.filter( ( product ) => ! includedItems.includes( product ) );
	domainItems = domainItems.filter( isDomainProduct );
	domainItems = Object.entries( groupBy( domainItems, 'meta' ) );
	domainItems = domainItems.sort( function ( pair ) {
		if ( pair[ 1 ][ 0 ] && pair[ 1 ][ 0 ].cost === 0 ) {
			return -1;
		}
		return pair[ 0 ];
	} );
	domainItems = domainItems.map( function ( pair ) {
		return pair[ 1 ].sort( getDomainProductRanking );
	} );
	domainItems = domainItems.flat();

	const creditItems = products.filter( isCredits );

	const otherItems = products.filter(
		( product ) =>
			! [ ...planItems, ...domainItems, ...includedItems, ...creditItems ].includes( product )
	);

	return planItems
		.concat( includedItems )
		.concat( domainItems )
		.concat( otherItems )
		.concat( creditItems );
}

function isIncludedWithPlan( purchase ) {
	return 'included' === purchase.expiryStatus;
}

export default sortProducts;
