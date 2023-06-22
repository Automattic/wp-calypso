import {
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY,
	useJetpack100GbStorageAmountText,
	useJetpack10GbStorageAmountText,
	useJetpack1TbStorageAmountText,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
} from '@automattic/calypso-products';
import { useMemo } from 'react';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import useItemPrice from 'calypso/my-sites/plans/jetpack-plans/use-item-price';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { getRewindBytesAvailable, getRewindBytesUsed } from 'calypso/state/rewind/selectors';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { TranslateResult } from 'i18n-calypso';

export type SelectorProductWithStorage = SelectorProduct & {
	storage: TranslateResult;
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
export const BYTES_10GB = 10737418240;
export const BYTES_100GB = 107374182400;
export const BYTES_1TB = 1073741824000;

export const storageToUpsellProduct: Record< number, string > = {
	[ BYTES_10GB ]: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY,
	[ BYTES_100GB ]: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY,
	[ BYTES_1TB ]: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY,
};
export const isJetpackProductSlugMatch =
	( slugList: Array< string > ) =>
	( { subscriptionStatus, productSlug }: Purchase ) =>
		subscriptionStatus === 'active' && slugList.includes( productSlug );

export default ( siteId: number ) => {
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );

	const TEN_GIGABYTES = useJetpack10GbStorageAmountText();
	const HUNDRED_GIGABYTES = useJetpack100GbStorageAmountText();
	const ONE_TERABYTES = useJetpack1TbStorageAmountText();

	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const bytesAvailable = useSelector( ( state ) => getRewindBytesAvailable( state, siteId ) );
	const bytesUsed = useSelector( ( state ) => getRewindBytesUsed( state, siteId ) );

	const upsellSlug = useMemo( () => {
		const ADD_ON_STORAGE_MAP: Record< string, TranslateResult > = {
			[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY ]: TEN_GIGABYTES,
			[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY ]: HUNDRED_GIGABYTES,
			[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY ]: ONE_TERABYTES,
		};

		//if usage has crossed over the storage limit, then dynamically calculate the upgrade option
		if ( bytesUsed && bytesAvailable && bytesUsed > bytesAvailable ) {
			const additionalBytesUsed = bytesUsed - bytesAvailable;

			// add aditional 25% buffer
			const additionalBytesNeeded = additionalBytesUsed + additionalBytesUsed * 0.25;

			//Since 1TB is our max upgrade but the additional storage needed is greater than 1TB, then just return 1TB
			if ( additionalBytesNeeded > BYTES_1TB ) {
				return {
					...slugToSelectorProduct( PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY ),
					storage: ADD_ON_STORAGE_MAP[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY ],
				} as SelectorProductWithStorage;
			}
			const matchedBytes =
				Object.keys( storageToUpsellProduct )
					.map( Number ) // .keys returns as strings, so convert it to a integer
					.sort( ( a, b ) => a - b ) // order of keys is not always guaranteed, so sort it before we do the search
					.find( ( bytes ) => bytes > additionalBytesNeeded ) ?? BYTES_10GB; // find the first add-on with storage aboev the current usage

			const upsellSlugId = storageToUpsellProduct[ matchedBytes ];
			return {
				...slugToSelectorProduct( upsellSlugId ),
				storage: ADD_ON_STORAGE_MAP[ upsellSlugId ],
			} as SelectorProductWithStorage;
		}

		//if usage is still within the storage limit then upgrade 10GB -> 10GB and 1TB -> 1TB
		if ( sitePurchases.some( isJetpackProductSlugMatch( UPGRADEABLE_STORAGE_PRODUCT_SLUGS_T1 ) ) ) {
			return {
				...slugToSelectorProduct( PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY ),
				storage: ADD_ON_STORAGE_MAP[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY ],
			} as SelectorProductWithStorage;
		}
		if ( sitePurchases.some( isJetpackProductSlugMatch( UPGRADEABLE_STORAGE_PRODUCT_SLUGS_T2 ) ) ) {
			return {
				...slugToSelectorProduct( PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY ),
				storage: ADD_ON_STORAGE_MAP[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY ],
			} as SelectorProductWithStorage;
		}
		return {
			...slugToSelectorProduct( PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY ),
			storage: ADD_ON_STORAGE_MAP[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY ],
		} as SelectorProductWithStorage;
	}, [
		TEN_GIGABYTES,
		HUNDRED_GIGABYTES,
		ONE_TERABYTES,
		sitePurchases,
		bytesUsed,
		bytesAvailable,
	] );

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
