import {
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY,
	//useJetpack100GbStorageAmountText,
	useJetpack10GbStorageAmountText,
	useJetpack1TbStorageAmountText,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
} from '@automattic/calypso-products';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import useItemPrice from 'calypso/my-sites/plans/jetpack-plans/use-item-price';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import type { Purchase } from 'calypso/lib/purchases/types';

type SelectorProductWithStorage = SelectorProduct & {
	storage: React.ReactChild;
};
const UPGRADEABLE_STORAGE_PRODUCT_SLUGS_T1 = [
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
];

const UPGRADEABLE_STORAGE_PRODUCT_SLUGS_T2 = [
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
];

export const isJetpackT1Product = ( { subscriptionStatus, productSlug }: Purchase ) => {
	return (
		subscriptionStatus === 'active' && UPGRADEABLE_STORAGE_PRODUCT_SLUGS_T1.includes( productSlug )
	);
};

export const isJetpackT2Product = ( { subscriptionStatus, productSlug }: Purchase ) => {
	return (
		subscriptionStatus === 'active' && UPGRADEABLE_STORAGE_PRODUCT_SLUGS_T2.includes( productSlug )
	);
};

export default ( siteId: number | null ) => {
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const TEN_GIGABYTES = useJetpack10GbStorageAmountText();
	//const HUNDRED_GIGABYTES = useJetpack100GbStorageAmountText();
	const ONE_TERABYTES = useJetpack1TbStorageAmountText();

	const currencyCode = sitePurchases?.[ 0 ]?.currencyCode;

	const upsellSlug = useMemo( () => {
		if ( sitePurchases.some( isJetpackT1Product ) ) {
			return {
				...slugToSelectorProduct( PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY ),
				storage: TEN_GIGABYTES,
			} as SelectorProductWithStorage;
		}
		if ( sitePurchases.some( isJetpackT2Product ) ) {
			return {
				...slugToSelectorProduct( PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY ),
				storage: ONE_TERABYTES,
			} as SelectorProductWithStorage;
		}
		return {
			...slugToSelectorProduct( PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY ),
			storage: TEN_GIGABYTES,
		} as SelectorProductWithStorage;
	}, [ sitePurchases, TEN_GIGABYTES, ONE_TERABYTES ] );

	const { originalPrice, isFetching } = useItemPrice(
		siteId,
		upsellSlug,
		upsellSlug?.monthlyProductSlug || ''
	);

	return useMemo(
		() => ( { upsellSlug, originalPrice, isPriceFetching: isFetching, currencyCode } ),
		[ upsellSlug, currencyCode, originalPrice, isFetching ]
	);
};
