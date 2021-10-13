import { getSitePurchases } from 'calypso/state/purchases/selectors/get-site-purchases';
import { TIER_1_SLUGS, TIER_2_SLUGS } from './constants';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { AppState } from 'calypso/types';

const hasUpgradeableStorage = ( slug: string ) =>
	TIER_1_SLUGS.includes( slug ) || TIER_2_SLUGS.includes( slug );

const getPurchasedStorageSubscriptions = ( state: AppState, siteId: number | null ): Purchase[] =>
	( getSitePurchases( state, siteId ) ?? [] )
		.filter( ( { subscriptionStatus } ) => subscriptionStatus === 'active' )
		.filter( ( { productSlug } ) => hasUpgradeableStorage( productSlug ) );

export default getPurchasedStorageSubscriptions;
