import {
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
} from '@automattic/calypso-products';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import type { AppState } from 'calypso/types';

const UPGRADEABLE_STORAGE_PRODUCT_SLUGS = [
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
];

const siteCanUpgradeBackupStorage = ( state: AppState, siteId: number | null ): boolean | null => {
	if ( siteId === null ) {
		return null;
	}

	const sitePurchases = getSitePurchases( state, siteId ) ?? [];
	return sitePurchases.some(
		( { subscriptionStatus, productSlug } ) =>
			subscriptionStatus === 'active' && UPGRADEABLE_STORAGE_PRODUCT_SLUGS.includes( productSlug )
	);
};

export default siteCanUpgradeBackupStorage;
