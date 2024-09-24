import { WPCOM_FEATURES_COPY_SITE } from '@automattic/calypso-products';
import { COPY_SITE_FLOW, addProductsToCart } from '@automattic/onboarding';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useDispatch } from '@wordpress/data';
import { useCallback } from 'react';
import { useQueryUserPurchases } from 'calypso/components/data/query-user-purchases';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { clearSignupDestinationCookie } from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import {
	hasLoadedUserPurchasesFromServer,
	isFetchingUserPurchases,
	getUserPurchases,
} from 'calypso/state/purchases/selectors';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import type { SiteExcerptData } from '@automattic/sites';
import type { Purchase } from 'calypso/lib/purchases/types';

interface SiteCopyOptions {
	enabled: boolean;
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
	const hasCopySiteFeature = useSelector( ( state ) =>
		siteHasFeature( state, site?.ID, WPCOM_FEATURES_COPY_SITE )
	);
	const isAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, site?.ID ) );
	const plan = site?.plan;
	const isSiteOwner = site?.site_owner === userId;

	useQueryUserPurchases( options.enabled );
	const isLoadingPurchases = useSelector(
		( state ) => isFetchingUserPurchases( state ) || ! hasLoadedUserPurchasesFromServer( state )
	);

	const purchases = useSelector( getUserPurchases );

	const { setPlanCartItem, setProductCartItems, resetOnboardStore } = useDispatch( ONBOARD_STORE );

	const shouldShowSiteCopyItem =
		options.enabled &&
		hasCopySiteFeature &&
		isSiteOwner &&
		plan &&
		isAtomic &&
		! isLoadingPurchases;

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

	return {
		shouldShowSiteCopyItem,
		startSiteCopy,
		resumeSiteCopy,
		isFetching: isLoadingPurchases,
	};
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
