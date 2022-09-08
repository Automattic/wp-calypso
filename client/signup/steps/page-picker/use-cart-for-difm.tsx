import { isEnabled } from '@automattic/calypso-config';
import {
	PLAN_PREMIUM,
	PLAN_WPCOM_PRO,
	WPCOM_DIFM_LITE,
	getDIFMTieredPriceDetails,
	Product,
} from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { useShoppingCart } from '@automattic/shopping-cart';
import { LocalizeProps, useTranslate, TranslateResult } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import getCartKey from 'calypso/my-sites/checkout/get-cart-key';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { buildDIFMCartExtrasObject } from 'calypso/state/difm/assemblers';
import { requestProductsList } from 'calypso/state/products-list/actions';
import { getProductBySlug, isProductsListFetching } from 'calypso/state/products-list/selectors';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { debounce } from 'calypso/utils';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

export type CartItem = {
	nameOverride?: TranslateResult;
	productSlug: string;
	productOriginalName: string;
	productCost: number;
	meta?: JSX.Element | TranslateResult;
	productCount?: number;
	itemSubTotal: number;
};

type DummyCartParams = {
	selectedPages: string[];
	currencyCode: string;
	activePlanScheme: ProductListItem;
	difmLiteProduct: ProductListItem;
	translate: LocalizeProps[ 'translate' ];
};

function getDummyCartProducts( {
	selectedPages,
	currencyCode,
	activePlanScheme,
	difmLiteProduct,
	translate,
}: DummyCartParams ): CartItem[] {
	// const extraPageCount = Math.max( 0, selectedPages.length - FREE_PAGES );
	// const difmPriceDetail = getDIFMTieredPriceDetails(
	// 	difmLiteProduct as unknown as Product,
	// 	selectedPages.length
	// );
	let displayedCartItems: CartItem[] = [];
	if ( difmLiteProduct && activePlanScheme ) {
		displayedCartItems = [
			{
				productSlug: difmLiteProduct.product_slug,
				nameOverride: translate( 'Website Design Service' ),
				productOriginalName: difmLiteProduct.product_name,
				itemSubTotal: difmLiteProduct.cost,
				productCost: difmLiteProduct.cost,
				meta: translate( 'One-time fee' + selectedPages.length ),
			},
			{
				productSlug: activePlanScheme.product_slug,
				productOriginalName: activePlanScheme.product_name,
				itemSubTotal: activePlanScheme.cost,
				productCost: activePlanScheme.cost,
				meta: translate( 'Plan Subscription: %(planPrice)s per year', {
					args: {
						planPrice: formatCurrency( activePlanScheme.cost, currencyCode, { precision: 0 } ),
					},
				} ),
			},
		];
	}

	return displayedCartItems;
}

function getSiteCartProducts( {
	responseCart,
	translate,
	currencyCode,
}: {
	responseCart: ResponseCart;
	translate: LocalizeProps[ 'translate' ];
	currencyCode: string;
} ): CartItem[] {
	const cartItems: CartItem[] = responseCart.products.map( ( product ) => {
		switch ( product.product_slug ) {
			case PLAN_WPCOM_PRO:
			case PLAN_PREMIUM:
				return {
					productSlug: product.product_slug,
					productOriginalName: product.product_name,
					itemSubTotal: product.cost,
					productCost: product.cost,
					meta: translate( 'Plan Subscription: %(planPrice)s per year', {
						args: { planPrice: product.product_cost_display },
					} ),
				};
			case WPCOM_DIFM_LITE: {
				const difmTieredPrices = getDIFMTieredPriceDetails(
					product as unknown as Product,
					product.quantity ?? 1
				);
				let meta: JSX.Element = <>{ translate( 'one-time fee' ) }</>;
				if ( difmTieredPrices ) {
					const { extraPageCount, extraPagesPrice } = difmTieredPrices;
					if ( extraPageCount && extraPageCount > 0 ) {
						meta = (
							<>
								{ translate( 'Service: %(productCost)s one-time fee', {
									args: {
										productCost: product.item_original_cost_for_quantity_one_display,
									},
								} ) }
								<br></br>
								{ translate(
									'%(numberOfExtraPages)d Extra Page: %(costOfExtraPages)s one-time fee',
									'%(numberOfExtraPages)d Extra Pages: %(costOfExtraPages)s one-time fee',
									{
										args: {
											numberOfExtraPages: extraPageCount,
											costOfExtraPages: extraPagesPrice,
										},
										count: extraPageCount,
									}
								) }
							</>
						);
					}
				}

				return {
					productSlug: product.product_slug,
					nameOverride: translate( 'Website Design Service' ),
					productOriginalName: product.product_name,
					itemSubTotal: product.cost,
					productCost: product.cost,
					meta,
				};
			}
			default:
				return {
					productSlug: product.product_slug,
					nameOverride: translate( 'Website Design Service' ),
					productOriginalName: product.product_name,
					itemSubTotal: product.cost,
					productCost: product.cost,
					meta: translate( 'One-time fee' ),
				};
		}
	} );
	return cartItems;
}

export function useCartForDIFM( selectedPages: string[] ): {
	items: CartItem[];
	total: string | null;
	isCartLoading: boolean;
	isCartPendingUpdate: boolean;
	isCartUpdateStarted: boolean;
	isProductsLoading: boolean;
	effectiveCurrencyCode: string | null;
	isFormattedCurrencyLoading: boolean;
} {
	//This state is used by loader states to provide immediate feedback when a deebounced change happens to a cart
	const [ isCartUpdateStarted, setIsCartUpdateStarted ] = useState( false );

	const signupDependencies = useSelector( getSignupDependencyStore );
	const translate = useTranslate();
	const dispatch = useDispatch();
	const proPlan = useSelector( ( state ) => getProductBySlug( state, PLAN_WPCOM_PRO ) );
	const premiumPlan = useSelector( ( state ) => getProductBySlug( state, PLAN_PREMIUM ) );
	const activePremiumPlanScheme = isEnabled( 'plans/pro-plan' ) ? proPlan : premiumPlan;
	const { newOrExistingSiteChoice, siteId, siteSlug } = signupDependencies;
	const isExistingSite = newOrExistingSiteChoice === 'existing-site';
	const isProductsLoading = useSelector( isProductsListFetching );
	const difmLiteProduct = useSelector( ( state ) => getProductBySlug( state, WPCOM_DIFM_LITE ) );
	const userCurrencyCode = useSelector( getCurrentUserCurrencyCode );
	const site = useSelector( ( state ) => getSite( state, siteSlug ?? siteId ) );
	const cartKey = getCartKey( { selectedSite: site } );
	const { replaceProductsInCart, responseCart, isLoading, isPendingUpdate } = useShoppingCart(
		cartKey ?? undefined
	);

	const getEffectiveCurrencyCode = useCallback( () => {
		if ( isExistingSite ) {
			return responseCart.currency ?? userCurrencyCode;
		}
		return userCurrencyCode;
	}, [ isExistingSite, responseCart.currency, userCurrencyCode ] );

	// [Callback] Encapsulates difm lite cart product creation
	const getDifmLiteCartProduct = useCallback( () => {
		if ( difmLiteProduct ) {
			return {
				...difmLiteProduct,
				extra: buildDIFMCartExtrasObject( {
					...signupDependencies,
					selectedPageTitles: selectedPages,
				} ),
				quantity: selectedPages.length,
			};
		}
		return null;
	}, [ signupDependencies, selectedPages, difmLiteProduct ] );

	// [Effect] Loads required initial data
	useEffect( () => {
		if ( ! difmLiteProduct || ! userCurrencyCode ) {
			dispatch( requestProductsList() );
		}
	}, [ dispatch, difmLiteProduct ] );

	// [Effect] Updates flag to show loading feedback to the user on page selection change
	useEffect( () => {
		if ( isExistingSite ) {
			setIsCartUpdateStarted( true );
		}
	}, [ setIsCartUpdateStarted, selectedPages ] );

	const debouncedReplaceProductsInCart = useMemo(
		() =>
			debounce( async ( products ) => {
				await replaceProductsInCart( products );
				// Switch off loading feedback once basket is properly updated
				setIsCartUpdateStarted( false );
			}, 800 ),
		[ replaceProductsInCart ]
	);

	// [Effect] that controls cart manipulations
	useEffect( () => {
		if ( isExistingSite ) {
			const difmLiteProduct = getDifmLiteCartProduct();
			if ( difmLiteProduct && difmLiteProduct.product_slug ) {
				debouncedReplaceProductsInCart( [ difmLiteProduct ] );
			}
		}
	}, [ isExistingSite, getDifmLiteCartProduct, debouncedReplaceProductsInCart ] );

	const effectiveCurrencyCode = getEffectiveCurrencyCode();
	let displayedCartItems: CartItem[] = [];
	let totalCostFormatted = null;
	if ( difmLiteProduct && activePremiumPlanScheme && effectiveCurrencyCode ) {
		if ( isExistingSite ) {
			displayedCartItems = getSiteCartProducts( {
				responseCart,
				translate,
				currencyCode: effectiveCurrencyCode,
			} );
		} else {
			displayedCartItems = getDummyCartProducts( {
				selectedPages,
				currencyCode: effectiveCurrencyCode,
				translate,
				activePlanScheme: activePremiumPlanScheme,
				difmLiteProduct,
			} );
		}

		const totalCost = displayedCartItems.reduce(
			( total, currentProduct ) => currentProduct.itemSubTotal + total,
			0
		);
		totalCostFormatted = formatCurrency( totalCost, effectiveCurrencyCode, {
			precision: 0,
		} );
	}
	const isInitialBasketLoaded = displayedCartItems.length > 1;
	return {
		items: displayedCartItems,
		total: totalCostFormatted,
		isCartLoading: isLoading,
		isCartPendingUpdate: isPendingUpdate,
		isProductsLoading,
		isCartUpdateStarted,
		effectiveCurrencyCode,
		// Proper formatted currency is visible only when the following conditions are met
		isFormattedCurrencyLoading:
			( isExistingSite && isLoading ) ||
			! isInitialBasketLoaded ||
			! effectiveCurrencyCode ||
			isProductsLoading,
	};
}

export default useCartForDIFM;
