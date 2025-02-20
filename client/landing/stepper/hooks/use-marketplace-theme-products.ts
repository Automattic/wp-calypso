import { getThemeIdFromDesign } from '@automattic/design-picker';
import { useSelect } from '@wordpress/data';
import { useQueryProductsList } from 'calypso/components/data/query-products-list';
import { useQuerySiteFeatures } from 'calypso/components/data/query-site-features';
import { useQuerySitePurchases } from 'calypso/components/data/query-site-purchases';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { useSelector } from 'calypso/state';
import {
	getProductBillingSlugByThemeId,
	getProductsByBillingSlug,
	isProductsListFetching,
} from 'calypso/state/products-list/selectors';
import { isFetchingSitePurchases } from 'calypso/state/purchases/selectors';
import {
	isMarketplaceThemeSubscribed as getIsMarketplaceThemeSubscribed,
	isSiteEligibleForManagedExternalThemes,
} from 'calypso/state/themes/selectors';
import { getPreferredBillingCycleProductSlug } from 'calypso/state/themes/theme-utils';
import { useSiteData } from './use-site-data';
import type { OnboardSelect } from '@automattic/data-stores';

export const useMarketplaceThemeProducts = () => {
	const { site } = useSiteData();

	const selectedDesign = useSelect( ( select ) => {
		const { getSelectedDesign } = select( ONBOARD_STORE ) as OnboardSelect;
		return getSelectedDesign();
	}, [] );

	const selectedDesignThemeId = selectedDesign ? getThemeIdFromDesign( selectedDesign ) : null;

	const isExternallyManagedThemeAvailable = useSelector(
		( state ) => site?.ID && isSiteEligibleForManagedExternalThemes( state, site.ID )
	);

	const isLoadingProductList = useSelector( ( state ) => isProductsListFetching( state ) );
	const isLoadingSitePurchases = useSelector( ( state ) => isFetchingSitePurchases( state ) );

	const marketplaceThemeProducts =
		useSelector( ( state ) =>
			getProductsByBillingSlug(
				state,
				getProductBillingSlugByThemeId( state, selectedDesignThemeId ?? '' )
			)
		) || [];

	const marketplaceProductSlug =
		marketplaceThemeProducts.length !== 0
			? getPreferredBillingCycleProductSlug( marketplaceThemeProducts )
			: null;

	const selectedMarketplaceProduct =
		marketplaceThemeProducts.find(
			( product ) => product.product_slug === marketplaceProductSlug
		) || marketplaceThemeProducts[ 0 ];

	const isMarketplaceThemeSubscribed = useSelector(
		( state ) =>
			site &&
			selectedDesignThemeId &&
			getIsMarketplaceThemeSubscribed( state, selectedDesignThemeId, site.ID )
	);

	const isMarketplaceThemeSubscriptionNeeded = !! (
		marketplaceProductSlug && ! isMarketplaceThemeSubscribed
	);

	const selectedMarketplaceProductCartItems =
		selectedDesign?.is_externally_managed && isMarketplaceThemeSubscriptionNeeded
			? [ marketplaceProductSlug ]
			: [];

	useQueryProductsList();
	useQuerySiteFeatures( [ site?.ID ] );
	useQuerySitePurchases( site?.ID ?? -1 );

	return {
		isLoading: isLoadingProductList || isLoadingSitePurchases,
		selectedMarketplaceProduct,
		selectedMarketplaceProductCartItems,
		isMarketplaceThemeSubscriptionNeeded,
		isMarketplaceThemeSubscribed,
		isExternallyManagedThemeAvailable,
	};
};
