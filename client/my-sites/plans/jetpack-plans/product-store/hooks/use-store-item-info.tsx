import {
	isJetpackPlanSlug,
	JetpackPurchasableItemSlug,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	planHasFeature,
	TERM_ANNUALLY,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import isSupersedingJetpackItem from 'calypso/../packages/calypso-products/src/is-superseding-jetpack-item';
import { getPurchaseByProductSlug } from 'calypso/lib/purchases/utils';
import reactNodeToString from 'calypso/lib/react-node-to-string';
import OwnerInfo from 'calypso/me/purchases/purchase-item/owner-info';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { useIsUserPurchaseOwner } from 'calypso/state/purchases/utils';
import {
	getSitePlan,
	getSiteProducts,
	getSiteSlug,
	isJetpackCloudCartEnabled,
	isJetpackSiteMultiSite,
} from 'calypso/state/sites/selectors';
import { EXTERNAL_PRODUCTS_LIST, ITEM_TYPE_PLAN } from '../../constants';
import { buildCheckoutURL } from '../../get-purchase-url-callback';
import productButtonLabel from '../../product-card/product-button-label';
import { SelectorProduct } from '../../types';
import { UseStoreItemInfoProps } from '../types';
import { useShoppingCartTracker } from './use-shopping-cart-tracker';

const getIsDeprecated = ( item: SelectorProduct ) => Boolean( item.legacy );

const getIsExternal = ( item: SelectorProduct ) =>
	EXTERNAL_PRODUCTS_LIST.includes( item.productSlug );

const getIsMultisiteCompatible = ( item: SelectorProduct ) => {
	if ( isJetpackPlanSlug( item.productSlug ) ) {
		// plans containing Jetpack Backup and/or Jetpack Scan are incompatible with multisite installs
		return ! [ ...JETPACK_BACKUP_PRODUCTS, ...JETPACK_SCAN_PRODUCTS ].filter( ( productSlug ) =>
			planHasFeature( item.productSlug, productSlug )
		).length;
	}
	return ! (
		[ ...JETPACK_BACKUP_PRODUCTS, ...JETPACK_SCAN_PRODUCTS ] as ReadonlyArray< string >
	 ).includes( item.productSlug );
};

export const useStoreItemInfo = ( {
	createCheckoutURL,
	duration: selectedTerm,
	onClickPurchase,
	siteId,
}: UseStoreItemInfoProps ) => {
	const shouldShowCart = useSelector( isJetpackCloudCartEnabled );
	const sitePlan = useSelector( ( state ) => getSitePlan( state, siteId ) );
	const siteProducts = useSelector( ( state ) => getSiteProducts( state, siteId ) );
	const purchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const isMultisite = useSelector(
		( state ) => !! ( siteId && isJetpackSiteMultiSite( state, siteId ) )
	);
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	const isCurrentUserPurchaseOwner = useIsUserPurchaseOwner();
	const translate = useTranslate();

	const cartKey = useCartKey();
	const { responseCart, addProductsToCart } = useShoppingCart( cartKey );

	const shoppingCartTracker = useShoppingCartTracker();

	const getIsProductInCart = useCallback(
		( item: SelectorProduct ) => {
			if ( ! shouldShowCart ) {
				return false;
			}

			return responseCart.products.some( ( product ) => product.product_slug === item.productSlug );
		},
		[ shouldShowCart, responseCart ]
	);

	// Determine whether product is owned.
	const getIsOwned = useCallback(
		( item: SelectorProduct ) => {
			if ( sitePlan && sitePlan.product_slug === item.productSlug ) {
				return true;
			} else if ( siteProducts ) {
				return siteProducts
					.filter( ( product ) => ! product.expired )
					.map( ( product ) => product.productSlug )
					.includes( item.productSlug );
			}
			return false;
		},
		[ sitePlan, siteProducts ]
	);

	//Standalone products are currently not upgradable to yearly
	//Once the feature is enabled, remove the last condition to enable the upgrade button
	const getIsUpgradeableToYearly = useCallback(
		( item: SelectorProduct ) =>
			getIsOwned( item ) &&
			selectedTerm === TERM_ANNUALLY &&
			item.term === TERM_MONTHLY &&
			item.type === ITEM_TYPE_PLAN,
		[ getIsOwned, selectedTerm ]
	);

	const getIsPlanFeature = useCallback(
		( item: SelectorProduct ) =>
			!! ( sitePlan && planHasFeature( sitePlan.product_slug, item.productSlug ) ),
		[ sitePlan ]
	);

	const getIsIncludedInPlan = useCallback(
		( item: SelectorProduct ) => {
			return ! getIsOwned( item ) && getIsPlanFeature( item );
		},
		[ getIsOwned, getIsPlanFeature ]
	);

	const getIsSuperseded = useCallback(
		( item: SelectorProduct ) => {
			return !! (
				! getIsDeprecated( item ) &&
				! getIsOwned( item ) &&
				! getIsIncludedInPlan( item ) &&
				sitePlan &&
				item &&
				isSupersedingJetpackItem(
					sitePlan.product_slug as JetpackPurchasableItemSlug,
					item.productSlug as JetpackPurchasableItemSlug
				)
			);
		},
		[ getIsIncludedInPlan, getIsOwned, sitePlan ]
	);

	const getIsIncludedInPlanOrSuperseded = useCallback(
		( item: SelectorProduct ) => getIsIncludedInPlan( item ) || getIsSuperseded( item ),
		[ getIsIncludedInPlan, getIsSuperseded ]
	);

	const getPurchase = useCallback(
		( item: SelectorProduct ) => {
			const isPlanFeature = getIsPlanFeature( item );

			const isSuperseded = getIsSuperseded( item );

			// If item is a plan feature, use the plan purchase object.
			const purchase =
				isPlanFeature || isSuperseded
					? getPurchaseByProductSlug( purchases, sitePlan?.product_slug || '' )
					: getPurchaseByProductSlug( purchases, item.productSlug );

			return purchase;
		},
		[ getIsPlanFeature, getIsSuperseded, purchases, sitePlan?.product_slug ]
	);

	const getShouldShowCart = useCallback(
		( item: SelectorProduct ) => {
			return (
				shouldShowCart &&
				! isJetpackPlanSlug( item.productSlug ) &&
				! getIsExternal( item ) &&
				! getIsOwned( item )
			);
		},
		[ getIsOwned, shouldShowCart ]
	);

	const getCheckoutURL = useCallback(
		( item: SelectorProduct ) => {
			if ( getShouldShowCart( item ) ) {
				if ( getIsProductInCart( item ) ) {
					//navigate to checkout
					return buildCheckoutURL( siteSlug || '', '' );
				}
				return '';
			}
			return createCheckoutURL?.( item, getIsUpgradeableToYearly( item ), getPurchase( item ) );
		},

		[
			getShouldShowCart,
			createCheckoutURL,
			getIsUpgradeableToYearly,
			getPurchase,
			getIsProductInCart,
			siteSlug,
		]
	);

	const getOnClickPurchase = useCallback(
		( item: SelectorProduct ) => () => {
			if ( getShouldShowCart( item ) ) {
				if ( getIsProductInCart( item ) ) {
					//naviagate to the checkout page - handled by getCheckoutURL
					shoppingCartTracker( 'calypso_jetpack_shopping_cart_view_click', {
						productSlug: item.productSlug,
					} );
					return;
				}
				shoppingCartTracker( 'calypso_jetpack_shopping_cart_add_product', {
					productSlug: item.productSlug,
				} );
				return addProductsToCart( [ { product_slug: item.productSlug } ] );
			}

			return onClickPurchase?.( item, getIsUpgradeableToYearly( item ), getPurchase( item ) );
		},
		[
			getShouldShowCart,
			onClickPurchase,
			getIsUpgradeableToYearly,
			getPurchase,
			getIsProductInCart,
			addProductsToCart,
			shoppingCartTracker,
		]
	);

	const getIsUserPurchaseOwner = useCallback(
		( item: SelectorProduct ) => {
			const purchase = getPurchase( item );
			return isCurrentUserPurchaseOwner( purchase );
		},
		[ getPurchase, isCurrentUserPurchaseOwner ]
	);

	const getCtaLabel = useCallback(
		( item: SelectorProduct, fallbackLabel = translate( 'Get' ) ) => {
			const ctaLabel = productButtonLabel( {
				product: item,
				isOwned: getIsOwned( item ),
				isUpgradeableToYearly: getIsUpgradeableToYearly( item ),
				isDeprecated: getIsDeprecated( item ),
				isSuperseded: getIsSuperseded( item ),
				currentPlan: sitePlan,
				fallbackLabel: getShouldShowCart( item ) ? translate( 'Add to cart' ) : fallbackLabel,
				isInCart: getIsProductInCart( item ),
				isJetpackPlan: isJetpackPlanSlug( item.productSlug ),
			} );

			const purchase = getPurchase( item );

			if ( ! purchase || isCurrentUserPurchaseOwner( purchase ) ) {
				return ctaLabel;
			}

			return (
				<>
					{ ctaLabel }
					&nbsp;
					<OwnerInfo purchase={ purchase } />
				</>
			);
		},
		[
			getIsOwned,
			getIsUpgradeableToYearly,
			getIsSuperseded,
			sitePlan,
			getShouldShowCart,
			translate,
			getIsProductInCart,
			getPurchase,
			isCurrentUserPurchaseOwner,
		]
	);

	const getCtaAriaLabel = useCallback(
		( item: SelectorProduct ) => {
			return reactNodeToString(
				productButtonLabel( {
					product: item,
					isOwned: getIsOwned( item ),
					isUpgradeableToYearly: getIsUpgradeableToYearly( item ),
					isDeprecated: getIsDeprecated( item ),
					isSuperseded: getIsSuperseded( item ),
					currentPlan: sitePlan,
				} )
			);
		},
		[ getIsOwned, getIsUpgradeableToYearly, getIsSuperseded, sitePlan ]
	);

	return useMemo(
		() => ( {
			getCheckoutURL,
			getCtaLabel,
			getCtaAriaLabel,
			getIsDeprecated,
			getIsExternal,
			getIsIncludedInPlan,
			getIsIncludedInPlanOrSuperseded,
			getIsMultisiteCompatible,
			getIsOwned,
			getIsPlanFeature,
			getIsSuperseded,
			getIsUpgradeableToYearly,
			getIsUserPurchaseOwner,
			getOnClickPurchase,
			getIsProductInCart,
			getPurchase,
			isMultisite,
		} ),
		[
			getCheckoutURL,
			getCtaLabel,
			getCtaAriaLabel,
			getIsIncludedInPlan,
			getIsIncludedInPlanOrSuperseded,
			getIsOwned,
			getIsPlanFeature,
			getIsSuperseded,
			getIsUpgradeableToYearly,
			getIsUserPurchaseOwner,
			getOnClickPurchase,
			getIsProductInCart,
			getPurchase,
			isMultisite,
		]
	);
};
