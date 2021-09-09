import {
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	TERM_ANNUALLY,
	TERM_MONTHLY,
	getJetpackStorageAmountDisplays,
	JetpackSlugsWithStorage,
} from '@automattic/calypso-products';
import slugToSelectorProduct from '../slug-to-selector-product';
import { Duration, SelectorProduct } from '../types';

const getProductWithOverrides = ( slug: JetpackSlugsWithStorage ) => {
	const jetpackStorageAmountDisplays = getJetpackStorageAmountDisplays();

	return {
		...slugToSelectorProduct( slug ),
		displayName: jetpackStorageAmountDisplays[ slug ],
	};
};

export const getTieredBackupProducts = ( billingPeriod: Duration ) => {
	const backupProductsByBillingPeriod: { [ K in Duration ]: JetpackSlugsWithStorage[] } = {
		[ TERM_ANNUALLY ]: [ PRODUCT_JETPACK_BACKUP_T1_YEARLY, PRODUCT_JETPACK_BACKUP_T2_YEARLY ],
		[ TERM_MONTHLY ]: [ PRODUCT_JETPACK_BACKUP_T1_MONTHLY, PRODUCT_JETPACK_BACKUP_T2_MONTHLY ],
	};

	return backupProductsByBillingPeriod[ billingPeriod ].map(
		getProductWithOverrides
	) as SelectorProduct[];
};
