import {
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY,
	useJetpack100GbStorageAmountText,
	useJetpack10GbStorageAmountText,
	useJetpack1TbStorageAmountText,
} from '@automattic/calypso-products';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
	BYTES_10GB,
	BYTES_1TB,
	storageToUpsellProduct,
} from 'calypso/components/backup-storage-space/usage-warning/use-upsell-slug';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import useItemPrice from 'calypso/my-sites/plans/jetpack-plans/use-item-price';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import type { SelectorProductWithStorage } from 'calypso/components/backup-storage-space/usage-warning/use-upsell-slug';

/**
 * This hook is inspired in `calypso/components/backup-storage-space/usage-warning/use-upsell-slug`.
 * The main difference is that this hook returns the best storage addon according to the space needed
 * to fit an specific retention period that requires an storage upgrade.
 */
export default (
	siteId: number,
	currentSize: number,
	retentionDays: number,
	storageLimitBytes: number
) => {
	const TEN_GIGABYTES = useJetpack10GbStorageAmountText();
	const HUNDRED_GIGABYTES = useJetpack100GbStorageAmountText();
	const ONE_TERABYTES = useJetpack1TbStorageAmountText();
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const additionalBytesNeeded = currentSize * retentionDays - storageLimitBytes;

	const upsellSlug = useMemo( () => {
		const ADD_ON_STORAGE_MAP: Record< string, React.ReactChild > = {
			[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY ]: TEN_GIGABYTES,
			[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY ]: HUNDRED_GIGABYTES,
			[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY ]: ONE_TERABYTES,
		};

		// Since 1TB is our max upgrade but the additional storage needed is greater than 1TB, then just return 1TB
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
				.find( ( bytes ) => bytes > additionalBytesNeeded ) ?? BYTES_10GB; // find the first add-on with storage above the current usage

		const upsellSlugId = storageToUpsellProduct[ matchedBytes ];

		return {
			...slugToSelectorProduct( upsellSlugId ),
			storage: ADD_ON_STORAGE_MAP[ upsellSlugId ],
		} as SelectorProductWithStorage;
	}, [ TEN_GIGABYTES, HUNDRED_GIGABYTES, ONE_TERABYTES, additionalBytesNeeded ] );

	const { originalPrice, isFetching } = useItemPrice(
		siteId,
		upsellSlug,
		upsellSlug?.monthlyProductSlug || ''
	);

	return useMemo(
		() => ( { upsellSlug, originalPrice, isPriceFetching: isFetching as boolean, currencyCode } ),
		[ upsellSlug, currencyCode, originalPrice, isFetching ]
	);
};
