import { WPCOM_FEATURES_COPY_SITE } from '@automattic/calypso-products';
import { useDispatch } from '@wordpress/data';
import { useEffect, useMemo, useCallback } from 'react';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { useQuerySitePurchases } from 'calypso/components/data/query-site-purchases';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { clearSignupDestinationCookie } from 'calypso/signup/storageUtils';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import {
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { fetchSiteFeatures } from 'calypso/state/sites/features/actions';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

function useSafeSiteHasFeature( siteId: number, feature: string ) {
	const dispatch = useReduxDispatch();
	useEffect( () => {
		dispatch( fetchSiteFeatures( siteId ) );
	}, [ dispatch, siteId ] );

	return useSelector( ( state ) => {
		return siteHasFeature( state, siteId, feature );
	} );
}

export const useSiteCopy = (
	site: SiteExcerptData,
	recordTracks: ( eventName: string, extraProps?: Record< string, any > ) => void
) => {
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );
	const hasCopySiteFeature = useSafeSiteHasFeature( site.ID, WPCOM_FEATURES_COPY_SITE );
	const plan = site?.plan;
	const isSiteOwner = site.site_owner === userId;
	useQuerySitePurchases( site.ID );
	const isLoadingPurchase = useSelector(
		( state ) => isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state )
	);

	const { setPlanCartItem, setProductCartItems } = useDispatch( ONBOARD_STORE );

	const purchases = useSelector( ( state ) => getSitePurchases( state, site.ID ) );

	const shouldShowSiteCopyItem = useCallback( () => {
		return hasCopySiteFeature && isSiteOwner && plan && ! isLoadingPurchase;
	}, [ hasCopySiteFeature, isSiteOwner, plan, isLoadingPurchase ] );

	const startSiteCopy = useCallback( () => {
		if ( ! plan || ! purchases ) {
			return;
		}
		clearSignupDestinationCookie();
		setPlanCartItem( { product_slug: plan.product_slug } );
		const marketplacePluginProducts = purchases
			.filter( ( purchase ) => purchase.productType === 'marketplace_plugin' )
			.map( ( purchase ) => ( { product_slug: purchase.productSlug } ) );

		setProductCartItems( marketplacePluginProducts );
		recordTracks( 'calypso_sites_dashboard_site_action_copy_site_click' );
	}, [ plan, recordTracks, setPlanCartItem, setProductCartItems, purchases ] );

	return useMemo(
		() => ( {
			shouldShowSiteCopyItem,
			startSiteCopy,
		} ),
		[ shouldShowSiteCopyItem, startSiteCopy ]
	);
};
