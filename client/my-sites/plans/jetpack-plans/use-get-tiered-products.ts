import {
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	TERM_ANNUALLY,
	TERM_MONTHLY,
	getJetpackStorageAmountDisplays,
	JetpackSlugsWithStorage,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSiteProducts from 'calypso/state/sites/selectors/get-site-products';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import slugToSelectorProduct from './slug-to-selector-product';
import { Duration, SelectorProduct } from './types';

const getProductWithOverrides = ( slug: JetpackSlugsWithStorage ) => {
	const jetpackStorageAmountDisplays = getJetpackStorageAmountDisplays();

	return {
		...slugToSelectorProduct( slug ),
		displayName: jetpackStorageAmountDisplays[ slug ],
		buttonLabel: translate( 'Upgrade storage' ),
	};
};

export const useGetTieredBackupProducts = ( billingPeriod: Duration ) => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const purchasedTier1BackupProduct = useSelector( ( state ) => getSiteProducts( state, siteId ) )
		?.filter( ( product ) => ! product.expired )
		.map( ( { productSlug } ) => productSlug )
		.filter( ( productSlug ) =>
			[ PRODUCT_JETPACK_BACKUP_T1_YEARLY, PRODUCT_JETPACK_BACKUP_T1_MONTHLY ].includes(
				productSlug
			)
		)
		.pop() as JetpackSlugsWithStorage;

	const backupProductsByBillingPeriod: { [ Key in Duration ]: JetpackSlugsWithStorage[] } = {
		[ TERM_ANNUALLY ]: [
			purchasedTier1BackupProduct ?? PRODUCT_JETPACK_BACKUP_T1_YEARLY,
			PRODUCT_JETPACK_BACKUP_T2_YEARLY,
		],
		[ TERM_MONTHLY ]: [
			purchasedTier1BackupProduct ?? PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
			PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
		],
	};

	return backupProductsByBillingPeriod[ billingPeriod ].map(
		getProductWithOverrides
	) as SelectorProduct[];
};

export const useGetTieredSecurityProducts = ( billingPeriod: Duration ) => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const currentPlanSlug =
		useSelector( ( state ) => getSitePlan( state, siteId ) )?.product_slug || null;
	const purchasedTier1SecurityProduct = [
		PLAN_JETPACK_SECURITY_T1_YEARLY,
		PLAN_JETPACK_SECURITY_T1_MONTHLY,
	]
		.filter( ( planSlug ) => planSlug === currentPlanSlug )
		.pop() as JetpackSlugsWithStorage;

	const securityProductsByBillingPeriod: { [ Key in Duration ]: JetpackSlugsWithStorage[] } = {
		[ TERM_ANNUALLY ]: [
			purchasedTier1SecurityProduct ?? PLAN_JETPACK_SECURITY_T1_YEARLY,
			PLAN_JETPACK_SECURITY_T2_YEARLY,
		],
		[ TERM_MONTHLY ]: [
			purchasedTier1SecurityProduct ?? PLAN_JETPACK_SECURITY_T1_MONTHLY,
			PLAN_JETPACK_SECURITY_T2_MONTHLY,
		],
	};

	return securityProductsByBillingPeriod[ billingPeriod ].map(
		getProductWithOverrides
	) as SelectorProduct[];
};

export const useGetTieredProducts = ( billingPeriod: Duration ) => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const purchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );

	const tieredSecurityProducts = useGetTieredSecurityProducts( billingPeriod );
	const tieredBackupProducts = useGetTieredBackupProducts( billingPeriod );

	const hasSecurity =
		purchases
			.filter( ( purchase ) => 'active' === purchase.subscriptionStatus )
			.filter( ( purchase ) =>
				[
					PLAN_JETPACK_SECURITY_T1_MONTHLY,
					PLAN_JETPACK_SECURITY_T1_YEARLY,
					PLAN_JETPACK_SECURITY_T2_MONTHLY,
					PLAN_JETPACK_SECURITY_T2_YEARLY,
				].includes( purchase.productSlug )
			).length > 0;

	return hasSecurity ? tieredSecurityProducts : tieredBackupProducts;
};
