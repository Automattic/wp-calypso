import {
	isJetpackPlanSlug,
	JetpackPurchasableItemSlug,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	planHasFeature,
	TERM_ANNUALLY,
	TERM_MONTHLY,
	isSupersedingJetpackItem,
	JETPACK_COMPLETE_PLANS,
	JETPACK_SECURITY_PLANS,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getPurchaseByProductSlug } from 'calypso/lib/purchases/utils';
import reactNodeToString from 'calypso/lib/react-node-to-string';
import OwnerInfo from 'calypso/me/purchases/purchase-item/owner-info';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useDispatch, useSelector } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { useIsUserPurchaseOwner } from 'calypso/state/purchases/utils';
import {
	getSitePlan,
	getSiteProducts,
	getSiteSlug,
	isJetpackCloudCartEnabled,
	isJetpackSiteMultiSite,
} from 'calypso/state/sites/selectors';
import {
	EXTERNAL_PRODUCTS_LIST,
	INDIRECT_CHECKOUT_PRODUCTS_LIST,
	ITEM_TYPE_PLAN,
} from '../../constants';
import { buildCheckoutURL } from '../../get-purchase-url-callback';
import productButtonLabel from '../../product-card/product-button-label';
import { SelectorProduct } from '../../types';
import { UseStoreItemInfoProps } from '../types';
import { useShoppingCartTracker } from './use-shopping-cart-tracker';
const getIsDeprecated = ( item: SelectorProduct ) => Boolean( item.legacy );

const getIsExternal = ( item: SelectorProduct ) =>
	EXTERNAL_PRODUCTS_LIST.includes( item.productSlug );

// Indirect checkout products have more checkout flows, such as selecting plans on another page before being directed to the cart.
const getIsIndirectCheckout = ( item: SelectorProduct ) =>
	INDIRECT_CHECKOUT_PRODUCTS_LIST.includes( item.productSlug );

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
	const dispatch = useDispatch();

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
				return siteProducts.map( ( product ) => product.productSlug ).includes( item.productSlug );
			}
			return false;
		},
		[ sitePlan, siteProducts ]
	);

	const getIsExpired = useCallback(
		( item: SelectorProduct ) => {
			if ( sitePlan && sitePlan.product_slug === item.productSlug ) {
				return !! sitePlan.expired;
			} else if ( siteProducts ) {
				return !! siteProducts.find( ( product ) => product.productSlug === item.productSlug )
					?.expired;
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
			// If user owns the Jetpack Complete Plan/bundle, then JetPack Security plan/bundle should
			// be considered as included in the Complete plan ("Part of the current plan").
			const siteHasCompletePlan =
				sitePlan?.product_slug &&
				( JETPACK_COMPLETE_PLANS as ReadonlyArray< string > ).includes( sitePlan.product_slug );
			const itemIsSecurity = ( JETPACK_SECURITY_PLANS as ReadonlyArray< string > ).includes(
				item.productSlug
			);

			if ( siteHasCompletePlan && itemIsSecurity ) {
				return true;
			}
			return ! getIsOwned( item ) && getIsPlanFeature( item );
		},
		[ getIsOwned, getIsPlanFeature, sitePlan ]
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
				// If the product is owned or included in the current plan, return the "Manage plan/Subscription"
				// URL (`/me/purchases/:site/:productId`)
				if ( getIsOwned( item ) || getIsIncludedInPlan( item ) ) {
					return createCheckoutURL?.( item, getIsUpgradeableToYearly( item ), getPurchase( item ) );
				}
				// Otherwise no URL is returned and we will end up dispatching adding product to cart on click event.
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
			getIsOwned,
			getIsIncludedInPlan,
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
				// If the product is owned or included in the current plan, we are navigating to the
				// "Manage plan/Subscription" URL (`/me/purchases/:site/:productId`) - handled by getCheckoutURL.
				if ( getIsOwned( item ) || getIsIncludedInPlan( item ) ) {
					recordTracksEvent( 'calypso_pricing_manage_owned_product_click', {
						productSlug: item.productSlug,
					} );
					return;
				}

				shoppingCartTracker( 'calypso_jetpack_shopping_cart_add_product', {
					productSlug: item.productSlug,
					quantity: item.quantity,
				} );

				const addedToCartText = translate( 'added to cart' );
				const productName = reactNodeToString( item.displayName );
				dispatch( successNotice( `${ productName } ${ addedToCartText }`, { duration: 5000 } ) );
				return addProductsToCart( [ { product_slug: item.productSlug, quantity: item.quantity } ] );
			}

			if ( item.type === 'item-type-plan' ) {
				recordTracksEvent( 'calypso_pricing_purchase_bundle_click', {
					productSlug: item.productSlug,
				} );
				return;
			}
			return onClickPurchase?.( item, getIsUpgradeableToYearly( item ), getPurchase( item ) );
		},
		[
			getShouldShowCart,
			onClickPurchase,
			getIsUpgradeableToYearly,
			getPurchase,
			getIsProductInCart,
			getIsOwned,
			getIsIncludedInPlan,
			shoppingCartTracker,
			translate,
			dispatch,
			addProductsToCart,
		]
	);

	const getIsUserPurchaseOwner = useCallback(
		( item: SelectorProduct ) => {
			const purchase = getPurchase( item );
			return isCurrentUserPurchaseOwner( purchase );
		},
		[ getPurchase, isCurrentUserPurchaseOwner ]
	);

	const getLightBoxCtaLabel = useCallback(
		( item: SelectorProduct, fallbackLabel = translate( 'Proceed to checkout' ) ) => {
			const isProductInCart = getIsProductInCart( item );
			const lightBoxCtaLabel = productButtonLabel( {
				product: item,
				isOwned: getIsOwned( item ),
				isUpgradeableToYearly: getIsUpgradeableToYearly( item ),
				isDeprecated: getIsDeprecated( item ),
				isSuperseded: getIsSuperseded( item ),
				currentPlan: sitePlan,
				fallbackLabel: getShouldShowCart( item ) ? translate( 'Add to cart' ) : fallbackLabel,
				isInCart: isProductInCart,
				isJetpackPlan: isJetpackPlanSlug( item.productSlug ),
			} );

			if ( isProductInCart ) {
				return (
					<>
						<Gridicon icon="checkmark" />
						{ lightBoxCtaLabel }
					</>
				);
			}

			return lightBoxCtaLabel;
		},
		[
			getIsProductInCart,
			getShouldShowCart,
			getIsOwned,
			getIsUpgradeableToYearly,
			getIsSuperseded,
			sitePlan,
			translate,
		]
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
			getIsIndirectCheckout,
			getIsIncludedInPlan,
			getIsIncludedInPlanOrSuperseded,
			getIsMultisiteCompatible,
			getIsOwned,
			getIsExpired,
			getIsPlanFeature,
			getIsSuperseded,
			getIsUpgradeableToYearly,
			getIsUserPurchaseOwner,
			getLightBoxCtaLabel,
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
			getIsExpired,
			getIsPlanFeature,
			getIsSuperseded,
			getIsUpgradeableToYearly,
			getIsUserPurchaseOwner,
			getLightBoxCtaLabel,
			getOnClickPurchase,
			getIsProductInCart,
			getPurchase,
			isMultisite,
		]
	);
};
