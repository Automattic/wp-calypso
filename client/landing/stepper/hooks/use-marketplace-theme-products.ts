import { FEATURE_WOOP, WPCOM_FEATURES_ATOMIC } from '@automattic/calypso-products';
import { Purchases, Site } from '@automattic/data-stores';
import { getThemeIdFromDesign } from '@automattic/design-picker';
import { useQuery } from '@tanstack/react-query';
import { useSelect } from '@wordpress/data';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import wpcom from 'calypso/lib/wp';
import { getPreferredBillingCycleProductSlug } from 'calypso/state/themes/theme-utils';
import { useSiteData } from './use-site-data';
import type { OnboardSelect } from '@automattic/data-stores';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

type ProductsListResponse = Record< string, ProductListItem >;

const useProductsList = () =>
	useQuery< ProductsListResponse >( {
		queryKey: [ 'marketplace-products-list' ],
		queryFn: () => wpcom.req.get( '/products', { type: 'all' } ),
		staleTime: 5 * 60 * 1000,
	} );

export const useMarketplaceThemeProducts = () => {
	const { site } = useSiteData();

	const selectedDesign = useSelect( ( select ) => {
		const { getSelectedDesign } = select( ONBOARD_STORE ) as OnboardSelect;
		return getSelectedDesign();
	}, [] );

	const selectedDesignThemeId = selectedDesign ? getThemeIdFromDesign( selectedDesign ) : null;
	const billingProductSlug = selectedDesignThemeId
		? `wp-mp-theme-${ selectedDesignThemeId }`
		: null;

	const { isLoading: isLoadingProducts, data: productsData } = useProductsList();

	const { isLoading: isLoadingSiteFeatures, data: siteFeatures } = Site.useSiteFeatures( {
		siteIdOrSlug: site?.ID,
	} );

	const { isLoading: isLoadingSitePurchases, data: sitePurchasesData } = Purchases.useSitePurchases(
		{ siteId: site?.ID }
	);

	const allProductsList = productsData ? Object.values( productsData ) : [];
	const sitePurchasesList = sitePurchasesData ? Object.values( sitePurchasesData ) : [];

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
			marketplaceThemeProducts.some( ( p ) => purchase.productSlug === p.product_slug )
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
		selectedMarketplaceProduct,
		selectedMarketplaceProductCartItems,
		isMarketplaceThemeSubscriptionNeeded,
		isMarketplaceThemeSubscribed,
		isExternallyManagedThemeAvailable,
	};
};
