import { productsQuery, siteFeaturesQuery, sitePurchasesQuery } from '@automattic/api-queries';
import { FEATURE_WOOP, WPCOM_FEATURES_ATOMIC } from '@automattic/calypso-products';
import { getThemeIdFromDesign } from '@automattic/design-picker';
import { useQuery } from '@tanstack/react-query';
import { useSelect } from '@wordpress/data';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { getPreferredBillingCycleProductSlug } from 'calypso/state/themes/theme-utils';
import { useSiteData } from './use-site-data';
import type { OnboardSelect } from '@automattic/data-stores';

interface UseMarketplaceThemeProductsProps {
	siteId?: number;
}

export const useMarketplaceThemeProducts = ( {
	siteId: providedSiteId,
}: UseMarketplaceThemeProductsProps = {} ) => {
	const { site } = useSiteData();
	const siteId = providedSiteId ?? site?.ID;

	const selectedDesign = useSelect( ( select ) => {
		const { getSelectedDesign } = select( ONBOARD_STORE ) as OnboardSelect;
		return getSelectedDesign();
	}, [] );

	const selectedDesignThemeId = selectedDesign ? getThemeIdFromDesign( selectedDesign ) : null;
	const billingProductSlug = selectedDesignThemeId
		? `wp-mp-theme-${ selectedDesignThemeId }`
		: null;

	const {
		isLoading: isLoadingProducts,
		isError: isErrorProducts,
		data: productsData,
	} = useQuery( productsQuery( 'all' ) );

	const {
		isLoading: isLoadingSiteFeatures,
		isError: isErrorSiteFeatures,
		data: siteFeatures,
	} = useQuery( {
		...siteFeaturesQuery( siteId as number ),
		enabled: !! siteId,
	} );

	const {
		isLoading: isLoadingSitePurchases,
		isError: isErrorSitePurchases,
		data: sitePurchasesData,
	} = useQuery( {
		...sitePurchasesQuery( siteId as number ),
		enabled: !! siteId,
	} );

	const allProductsList = productsData ? Object.values( productsData ) : [];
	const sitePurchasesList = sitePurchasesData ?? [];

	const isExternallyManagedThemeAvailable = !! (
		siteFeatures?.active?.includes( FEATURE_WOOP ) &&
		siteFeatures?.active?.includes( WPCOM_FEATURES_ATOMIC )
	);

	const marketplaceThemeProducts = billingProductSlug
		? allProductsList.filter( ( p ) => p.billing_product_slug === billingProductSlug )
		: [];

	const marketplaceProductSlug =
		marketplaceThemeProducts.length !== 0
			? getPreferredBillingCycleProductSlug( marketplaceThemeProducts )
			: null;

	const selectedMarketplaceProduct =
		marketplaceThemeProducts.find( ( p ) => p.product_slug === marketplaceProductSlug ) ??
		marketplaceThemeProducts[ 0 ];

	const isMarketplaceThemeSubscribed = !! (
		marketplaceThemeProducts.length > 0 &&
		sitePurchasesList.some( ( purchase ) =>
			marketplaceThemeProducts.some( ( p ) => purchase.product_slug === p.product_slug )
		)
	);

	const isMarketplaceThemeSubscriptionNeeded = !! (
		marketplaceProductSlug && ! isMarketplaceThemeSubscribed
	);

	const selectedMarketplaceProductCartItems =
		selectedDesign?.is_externally_managed && isMarketplaceThemeSubscriptionNeeded
			? [ marketplaceProductSlug ]
			: [];

	return {
		isLoading: isLoadingProducts || isLoadingSiteFeatures || isLoadingSitePurchases,
		isError: isErrorProducts || isErrorSiteFeatures || isErrorSitePurchases,
		selectedMarketplaceProduct,
		selectedMarketplaceProductCartItems,
		isMarketplaceThemeSubscriptionNeeded,
		isMarketplaceThemeSubscribed,
		isExternallyManagedThemeAvailable,
	};
};
