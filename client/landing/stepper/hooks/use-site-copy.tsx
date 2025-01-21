import { WPCOM_FEATURES_COPY_SITE } from '@automattic/calypso-products';
import { COPY_SITE_FLOW, addProductsToCart } from '@automattic/onboarding';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useMemo, useCallback } from 'react';
import { useQueryUserPurchases } from 'calypso/components/data/query-user-purchases';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { clearSignupDestinationCookie } from 'calypso/signup/storageUtils';
import { useDispatch as useReduxDispatch, useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import {
	hasLoadedUserPurchasesFromServer,
	isFetchingUserPurchases,
	getUserPurchases,
} from 'calypso/state/purchases/selectors';
import isRequestingSiteFeatures from 'calypso/state/selectors/is-requesting-site-features';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { fetchSiteFeatures } from 'calypso/state/sites/features/actions';
import type { SiteSelect } from '@automattic/data-stores';
import type { SiteExcerptData } from '@automattic/sites';
import type { Purchase } from 'calypso/lib/purchases/types';

interface SiteCopyOptions {
	enabled: boolean;
}

function useSafeSiteHasFeature( siteId: number | undefined, feature: string, enabled = true ) {
	const dispatch = useReduxDispatch();
	useEffect( () => {
		if ( ! siteId || ! enabled ) {
			return;
		}
		dispatch( fetchSiteFeatures( siteId ) );
	}, [ dispatch, siteId, enabled ] );

	return useSelector( ( state ) => {
		if ( ! siteId ) {
			return false;
		}
		return siteHasFeature( state, siteId, feature );
	} );
}

function getMarketplaceProducts( purchases: Purchase[] | null, siteId: number ) {
	return ( purchases || [] )
		.filter(
			( purchase ) =>
				[ 'marketplace_plugin', 'marketplace_theme' ].includes( purchase.productType ) &&
				purchase.siteId === siteId
		)
		.map( ( purchase ) => ( { product_slug: purchase.productSlug } ) );
}

function getPlanProduct( plan: SiteExcerptData[ 'plan' ] ) {
	return { product_slug: plan?.product_slug as string };
}

export const useSiteCopy = (
	site: Pick< SiteExcerptData, 'ID' | 'site_owner' | 'plan' > | undefined,
	options: SiteCopyOptions = { enabled: true }
) => {
	const userId = useSelector( getCurrentUserId );
	const hasCopySiteFeature = useSafeSiteHasFeature(
		site?.ID,
		WPCOM_FEATURES_COPY_SITE,
		options.enabled
	);
	const requestingSiteFeatures = useSelector( ( state ) =>
		isRequestingSiteFeatures( state, site?.ID )
	);
	const isAtomic = useSelect(
		( select ) =>
			site && options.enabled && ( select( SITE_STORE ) as SiteSelect ).isSiteAtomic( site?.ID ),
		[ site, options.enabled ]
	);
	const plan = site?.plan;
	const isSiteOwner = site?.site_owner === userId;

	useQueryUserPurchases( options.enabled );
	const isLoadingPurchases = useSelector(
		( state ) => isFetchingUserPurchases( state ) || ! hasLoadedUserPurchasesFromServer( state )
	);

	const purchases = useSelector( getUserPurchases );

	const { setPlanCartItem, setProductCartItems, resetOnboardStore } = useDispatch( ONBOARD_STORE );

	const shouldShowSiteCopyItem = useMemo( () => {
		return hasCopySiteFeature && isSiteOwner && plan && isAtomic && ! isLoadingPurchases;
	}, [ hasCopySiteFeature, isSiteOwner, plan, isLoadingPurchases, isAtomic ] );

	const startSiteCopy = useCallback( () => {
		if ( ! shouldShowSiteCopyItem || ! site?.ID ) {
			return;
		}
		clearSignupDestinationCookie();
		resetOnboardStore();
		const planProduct = getPlanProduct( plan );
		setPlanCartItem( planProduct );
		const marketplaceProducts = getMarketplaceProducts( purchases, site?.ID );
		setProductCartItems( marketplaceProducts );
	}, [
		shouldShowSiteCopyItem,
		site?.ID,
		resetOnboardStore,
		plan,
		setPlanCartItem,
		purchases,
		setProductCartItems,
	] );

	const resumeSiteCopy = useCallback(
		async ( destinationSiteSlug: string ) => {
			if ( ! shouldShowSiteCopyItem || ! site?.ID ) {
				return;
			}
			await addProductsToCart( destinationSiteSlug, COPY_SITE_FLOW, [
				getPlanProduct( plan ),
				...getMarketplaceProducts( purchases, site.ID ),
			] );
		},
		[ plan, purchases, shouldShowSiteCopyItem, site?.ID ]
	);

	return useMemo(
		() => ( {
			shouldShowSiteCopyItem,
			startSiteCopy,
			resumeSiteCopy,
			isFetching: isLoadingPurchases || requestingSiteFeatures,
		} ),
		[
			isLoadingPurchases,
			requestingSiteFeatures,
			resumeSiteCopy,
			shouldShowSiteCopyItem,
			startSiteCopy,
		]
	);
};

export const withSiteCopy = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const { shouldShowSiteCopyItem, startSiteCopy } = useSiteCopy( props.site );
		return (
			<Wrapped
				{ ...props }
				shouldShowSiteCopyItem={ shouldShowSiteCopyItem }
				startSiteCopy={ startSiteCopy }
			/>
		);
	},
	'withSiteCopy'
);
