/**
 * External dependencies
 */

import { difference, flatten, groupBy, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import { isIncludedWithPlan } from 'calypso/lib/purchases';
import { getDomainProductRanking, isCredits, isDomainProduct, isPlan } from '.';

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

	domainItems = difference( products, includedItems );
	domainItems = domainItems.filter( isDomainProduct );
	domainItems = Object.entries( groupBy( domainItems, 'meta' ) );
	domainItems = sortBy( domainItems, function ( pair ) {
		if ( pair[ 1 ][ 0 ] && pair[ 1 ][ 0 ].cost === 0 ) {
			return -1;
		}
		return pair[ 0 ];
	} );
	domainItems = domainItems.map( function ( pair ) {
		return sortBy( pair[ 1 ], getDomainProductRanking );
	} );
	domainItems = flatten( domainItems );

	const creditItems = products.filter( isCredits );

	const otherItems = difference( products, planItems, domainItems, includedItems, creditItems );

	return planItems
		.concat( includedItems )
		.concat( domainItems )
		.concat( otherItems )
		.concat( creditItems );
}

export default sortProducts;
