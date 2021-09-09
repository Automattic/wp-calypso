import {
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	// PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	// PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
} from '@automattic/calypso-products';
import slugToSelectorProduct from '../slug-to-selector-product';
import { Duration, SelectorProduct } from '../types';

export const getTieredBackupProducts = ( billingPeriod: Duration ) => {
	// TODO: remove (just making linter happy)
	if ( billingPeriod || ! billingPeriod ) {
		return [
			slugToSelectorProduct( PRODUCT_JETPACK_BACKUP_T1_YEARLY ),
			slugToSelectorProduct( PRODUCT_JETPACK_BACKUP_T2_YEARLY ),
		] as SelectorProduct[];
	}
};
