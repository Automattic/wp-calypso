import { JETPACK_BACKUP_ADDON_PRODUCTS } from '@automattic/calypso-products';
import { getSitePurchases } from 'calypso/state/purchases/selectors/get-site-purchases';
import { TIER_1_SLUGS, TIER_2_SLUGS } from './constants';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { AppState } from 'calypso/types';

const hasUpgradeableStorage = ( slug: string ) =>
	TIER_1_SLUGS.includes( slug ) ||
	TIER_2_SLUGS.includes( slug ) ||
	JETPACK_BACKUP_ADDON_PRODUCTS.includes(
		slug as ( typeof JETPACK_BACKUP_ADDON_PRODUCTS )[ number ]
	);

const getPurchasedStorageSubscriptions = ( state: AppState, siteId: number | null ): Purchase[] =>
	( getSitePurchases( state, siteId ) ?? [] )
		.filter( ( { subscriptionStatus } ) => subscriptionStatus === 'active' )
		.filter( ( { productSlug } ) => hasUpgradeableStorage( productSlug ) );

export default getPurchasedStorageSubscriptions;
