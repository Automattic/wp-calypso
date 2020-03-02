/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { getSitePlanSlug } from 'state/sites/selectors';
import { planHasFeature } from 'lib/plans';
import {
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
} from 'lib/products-values/constants';

/**
 * Determine the type of jetpack backup a site has ( if any )
 *
 * @param  {object}  state  Global state tree.
 * @param  {number} siteId Site ID.
 * @returns {?string} the backup type or null if there is no backup plan for the site
 */
const getJetpackBackupPlan = ( state: object, siteId: number ): 'realtime' | 'daily' | null => {
	const sitePlanSlug = getSitePlanSlug( state, siteId );

	if ( ! sitePlanSlug ) {
		return null;
	}

	if (
		find( [ PRODUCT_JETPACK_BACKUP_DAILY, PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ], productSlug =>
			planHasFeature( sitePlanSlug, productSlug )
		)
	) {
		return 'daily';
	}

	if (
		find(
			[ PRODUCT_JETPACK_BACKUP_REALTIME, PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ],
			productSlug => planHasFeature( sitePlanSlug, productSlug )
		)
	) {
		return 'realtime';
	}
	return null;
};

export default getJetpackBackupPlan;
