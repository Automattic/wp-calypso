/**
 * Internal dependencies
 */
import * as PlanConstants from 'calypso/lib/plans/constants';
import * as ProductConstants from 'calypso/lib/products-values/constants';

export const PRODUCTS_ORDER = [
	[ ...PlanConstants.JETPACK_SECURITY_PLANS ],
	[ ...ProductConstants.JETPACK_BACKUP_PRODUCTS ],
	[ ...ProductConstants.JETPACK_SCAN_PRODUCTS ],
	[ ...ProductConstants.JETPACK_SEARCH_PRODUCTS ],
	[ ...ProductConstants.JETPACK_CRM_PRODUCTS ],
	[ ...ProductConstants.JETPACK_ANTI_SPAM_PRODUCTS ],
	[ ...PlanConstants.JETPACK_COMPLETE_PLANS ],
];

const PRODUCTS_ORDER_BY_SLUG: { [ key: string ]: number } = {};
for ( let i = 0; i < PRODUCTS_ORDER.length; i++ ) {
	const currentPositionSlugs = PRODUCTS_ORDER[ i ];

	currentPositionSlugs.forEach( ( s ) => ( PRODUCTS_ORDER_BY_SLUG[ s ] = i ) );
}

export default PRODUCTS_ORDER_BY_SLUG;
