import { JETPACK_BACKUP_ADDON_PRODUCTS } from '@automattic/calypso-products';
import { getRawSitePurchases } from 'calypso/state/purchases/selectors/get-raw-site-purchases';
import { TIER_1_SLUGS, TIER_2_SLUGS } from './constants';
import type { Purchase } from '@automattic/api-core';
import type { AppState } from 'calypso/types';

const hasUpgradeableStorage = ( slug: string ) =>
	TIER_1_SLUGS.includes( slug ) ||
	TIER_2_SLUGS.includes( slug ) ||
	JETPACK_BACKUP_ADDON_PRODUCTS.includes(
		slug as ( typeof JETPACK_BACKUP_ADDON_PRODUCTS )[ number ]
	);

const getPurchasedStorageSubscriptions = ( state: AppState, siteId: number | null ): Purchase[] =>
	( getRawSitePurchases( state, siteId ) ?? [] )
		.filter( ( purchase ) => purchase.subscription_status === 'active' )
		.filter( ( purchase ) => hasUpgradeableStorage( purchase.product_slug ) );

export default getPurchasedStorageSubscriptions;
