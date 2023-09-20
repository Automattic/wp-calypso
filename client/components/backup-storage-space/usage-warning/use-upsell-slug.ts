import {
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY,
	useJetpack100GbStorageAmountText,
	useJetpack10GbStorageAmountText,
	useJetpack1TbStorageAmountText,
} from '@automattic/calypso-products';
import { useMemo } from 'react';
import { STORAGE_ESTIMATION_ADDITIONAL_BUFFER } from 'calypso/components/backup-retention-management/constants';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import useItemPrice from 'calypso/my-sites/plans/jetpack-plans/use-item-price';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import {
	getActivityLogVisibleDays,
	getBackupCurrentSiteSize,
	getBackupRetentionDays,
	getRewindBytesAvailable,
} from 'calypso/state/rewind/selectors';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { TranslateResult } from 'i18n-calypso';

export type SelectorProductWithStorage = SelectorProduct & {
	storage: TranslateResult;
};

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

export default ( siteId: number, retentionSelected?: number ) => {
	const TEN_GIGABYTES = useJetpack10GbStorageAmountText();
	const HUNDRED_GIGABYTES = useJetpack100GbStorageAmountText();
	const ONE_TERABYTES = useJetpack1TbStorageAmountText();

	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const lastBackupSize = useSelector( ( state ) =>
		getBackupCurrentSiteSize( state, siteId )
	) as number;
	const bytesAvailable = useSelector( ( state ) =>
		getRewindBytesAvailable( state, siteId )
	) as number;
	const estimatedCurrentSiteSize = lastBackupSize * ( STORAGE_ESTIMATION_ADDITIONAL_BUFFER + 1 );
	// Retention period included in customer plan
	const planRetentionPeriod = useSelector( ( state ) =>
		getActivityLogVisibleDays( state, siteId )
	);

	// Retention period set by customer (if any)
	const customerRetentionPeriod = useSelector( ( state ) =>
		getBackupRetentionDays( state, siteId )
	);
	// The retention days that currently applies for this customer.
	const currentRetentionPeriod =
		retentionSelected || customerRetentionPeriod || planRetentionPeriod || 0;

	const upsellSlug = useMemo( () => {
		const ADD_ON_STORAGE_MAP: Record< string, TranslateResult > = {
			[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY ]: TEN_GIGABYTES,
			[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY ]: HUNDRED_GIGABYTES,
			[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY ]: ONE_TERABYTES,
		};

		//if usage has crossed over the storage limit, then dynamically calculate the upgrade option
		const additionalBytesNeeded =
			estimatedCurrentSiteSize * currentRetentionPeriod - bytesAvailable;

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
	}, [
		TEN_GIGABYTES,
		HUNDRED_GIGABYTES,
		ONE_TERABYTES,
		estimatedCurrentSiteSize,
		currentRetentionPeriod,
		bytesAvailable,
	] );

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
