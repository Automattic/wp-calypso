/**
 * Internal dependencies
 */
import { getDomainProductRanking, isDomainProduct, isPlan } from './index';

// https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore
const groupBy = ( items, key ) =>
	items.reduce(
		( r, v, i, a, k = v[ key ] ) => ( ( r[ k ] || ( r[ k ] = [] ) ).push( v ), r ),
		{}
	);

/**
 * Sort all purchases in the following order:
 *
 * 1. Plans.
 * 2. Domains. Included in plans come first.
 *   a. Domain Registration
 *   b. Domain Mapping
 *   c. Privacy Protection
 * 3. Others.
 *
 * @param {object[]} products The purchase objects to sort
 * @returns {object[]} the sorted list of purchases
 */
export default function sortProducts( products ) {
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

	const otherItems = products.filter(
		( product ) => ! [ ...planItems, ...domainItems, ...includedItems ].includes( product )
	);

	return planItems.concat( includedItems ).concat( domainItems ).concat( otherItems );
}

function isIncludedWithPlan( purchase ) {
	return 'included' === purchase.expiryStatus;
}
