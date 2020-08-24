/**
 * External dependencies
 */
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import { getSitePlanSlug } from 'state/sites/plans/selectors';
import { getSitePurchases } from 'state/purchases/selectors';
import { planHasFeature } from 'lib/plans';
import {
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
} from 'lib/products-values/constants';

/**
 * Module variables
 */
const productSlugs = [ PRODUCT_JETPACK_BACKUP_REALTIME, PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ];

/**
 * True if the site supports Jetpack Real-time Backup, false otherwise.
 *
 * A site supports Jetpack Real-time Backup if either is true:
 * - it has an active Jetpack Backup Real-time purchase
 * - its current plan includes real time backups as a feature
 *
 * @param   {object}  state  Global state tree
 * @param   {number}  siteId ID of the site
 * @returns {boolean}        Whether site supports Jetpack Real-time Backup
 */
export default function siteSupportsRealtimeBackup( state, siteId ) {
	const currentPlanSlug = getSitePlanSlug( state, siteId );
	const purchases = getSitePurchases( state, siteId );

	const currentPlanSupportsRealtimeBackup = some( productSlugs, ( productSlug ) =>
		planHasFeature( currentPlanSlug, productSlug )
	);
	const hasActiveRealtimeBackupProduct = some(
		purchases,
		( purchase ) =>
			purchase.active &&
			some( productSlugs, ( productSlug ) => productSlug === purchase.productSlug )
	);

	return currentPlanSupportsRealtimeBackup || hasActiveRealtimeBackupProduct;
}
