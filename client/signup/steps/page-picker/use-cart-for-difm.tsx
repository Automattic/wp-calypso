import {
	PLAN_PREMIUM,
	WPCOM_DIFM_LITE,
	getDIFMTieredPriceDetails,
	PLAN_BUSINESS,
} from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { MinimalRequestCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import debugFactory from 'debug';
import { LocalizeProps, useTranslate, TranslateResult } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import getCartKey from 'calypso/my-sites/checkout/get-cart-key';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { buildDIFMCartExtrasObject } from 'calypso/state/difm/assemblers';
import { requestProductsList } from 'calypso/state/products-list/actions';
import { getProductBySlug, isProductsListFetching } from 'calypso/state/products-list/selectors';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { debounce } from 'calypso/utils';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

const debug = debugFactory( 'calypso:difm:page-picker' );
export type CartItem = {
	nameOverride?: TranslateResult;
	productSlug: string;
	productOriginalName: string;
	productDisplayCost: string | null;
	subLabel?: TranslateResult;
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

function getDIFMPriceBreakdownSubLabel( {
	product,
	noOfPages,
	currencyCode,
	translate,
}: {
	product: ProductListItem;
	noOfPages: number | null;
	currencyCode: string;
	translate: LocalizeProps[ 'translate' ];
} ): { subLabel: TranslateResult } {
	let subLabel: TranslateResult = translate( 'one-time fee' );

	if ( noOfPages == null ) {
		return { subLabel };
	}

	const difmTieredPrices = getDIFMTieredPriceDetails( product, noOfPages );
	if ( difmTieredPrices ) {
		const { extraPageCount, extraPagesPrice, formattedOneTimeFee } = difmTieredPrices;
		if (
			typeof extraPagesPrice === 'number' &&
			typeof extraPageCount === 'number' &&
			extraPageCount > 0
		) {
			subLabel = (
				<>
					{ translate( 'Service: %(productCost)s one-time fee', {
						args: {
							productCost: formattedOneTimeFee as string,
						},
					} ) }
					<br></br>
					{ translate(
						'%(numberOfExtraPages)d Extra Page: %(costOfExtraPages)s one-time fee',
						'%(numberOfExtraPages)d Extra Pages: %(costOfExtraPages)s one-time fee',
						{
							args: {
								numberOfExtraPages: extraPageCount,
								costOfExtraPages: formatCurrency( extraPagesPrice, currencyCode, {
									stripZeros: true,
									isSmallestUnit: true,
								} ),
							},
							count: extraPageCount,
						}
					) }
				</>
			);
		}
	}
	return { subLabel };
}

function getDummyCartProducts( {
	selectedPages,
	currencyCode,
	activePlanScheme,
	difmLiteProduct,
	translate,
}: DummyCartParams ): Array< CartItem > {
	let displayedCartItems: CartItem[] = [];
	if ( difmLiteProduct && activePlanScheme ) {
		//In case price tiers are not set fallback to default difm lite price
		let difmLiteItemPrice = difmLiteProduct.cost_smallest_unit;
		const difmPriceDetals = getDIFMTieredPriceDetails( difmLiteProduct, selectedPages.length );
		if ( difmPriceDetals ) {
			const { oneTimeFee, extraPagesPrice } = difmPriceDetals;
			if ( extraPagesPrice ) {
				difmLiteItemPrice = oneTimeFee + extraPagesPrice;
			}
		}
		displayedCartItems = [
			{
				productSlug: difmLiteProduct.product_slug,
				nameOverride: translate( 'Website Design Service' ),
				productOriginalName: difmLiteProduct.product_name,
				itemSubTotal: difmLiteItemPrice,
				productDisplayCost: formatCurrency( difmLiteItemPrice, currencyCode, {
					isSmallestUnit: true,
					stripZeros: true,
				} ),
				...getDIFMPriceBreakdownSubLabel( {
					product: difmLiteProduct,
					noOfPages: selectedPages.length,
					currencyCode,
					translate,
				} ),
			},
			{
				productSlug: activePlanScheme.product_slug,
				productOriginalName: activePlanScheme.product_name,
				itemSubTotal: activePlanScheme.cost_smallest_unit,
				productDisplayCost: formatCurrency( activePlanScheme.cost_smallest_unit, currencyCode, {
					isSmallestUnit: true,
					stripZeros: true,
				} ),
				subLabel: translate( 'Plan Subscription: %(planPrice)s per year', {
					args: {
						planPrice: formatCurrency( activePlanScheme.cost_smallest_unit, currencyCode, {
							isSmallestUnit: true,
							stripZeros: true,
						} ),
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
	difmLiteProduct,
}: {
	responseCart: ResponseCart;
	translate: LocalizeProps[ 'translate' ];
	difmLiteProduct: ProductListItem;
} ): Array< CartItem > {
	const cartItems: Array< CartItem | null > = responseCart.products.map( ( product ) => {
		switch ( product.product_slug ) {
			case PLAN_PREMIUM:
			case PLAN_BUSINESS:
				return {
					productSlug: product.product_slug,
					productOriginalName: product.product_name,
					itemSubTotal: product.item_subtotal_integer,
					productDisplayCost: formatCurrency(
						product.item_subtotal_integer,
						responseCart.currency,
						{
							isSmallestUnit: true,
							stripZeros: true,
						}
					),
					subLabel: translate( 'Plan Subscription: %(planPrice)s per year', {
						args: {
							planPrice: formatCurrency( product.item_subtotal_integer, responseCart.currency, {
								isSmallestUnit: true,
								stripZeros: true,
							} ),
						},
					} ),
				};
			case WPCOM_DIFM_LITE: {
				return {
					productSlug: product.product_slug,
					nameOverride: translate( 'Website Design Service' ),
					productOriginalName: product.product_name,
					itemSubTotal: product.item_subtotal_integer,
					productDisplayCost: formatCurrency(
						product.item_subtotal_integer,
						responseCart.currency,
						{
							isSmallestUnit: true,
							stripZeros: true,
						}
					),
					...getDIFMPriceBreakdownSubLabel( {
						product: difmLiteProduct,
						noOfPages: product.quantity,
						currencyCode: responseCart.currency,
						translate,
					} ),
				};
			}
			default:
				debug(
					'We show only products relevent to the DIFM flow and the following product was hidden',
					product
				);
				return null;
		}
	} );

	// Enforce order of display, so that the DIFM product is visible first
	const difmRelatedCartItems = cartItems.filter( ( e ) => e !== null );
	const difmProduct = difmRelatedCartItems.find( ( e ) => e?.productSlug === WPCOM_DIFM_LITE );
	const planProduct = difmRelatedCartItems.find( ( e ) =>
		[ PLAN_PREMIUM, PLAN_BUSINESS ].includes( e?.productSlug || '' )
	);

	//Enforce order
	const finalCartItems: CartItem[] = [];
	if ( difmProduct ) {
		finalCartItems.push( difmProduct );
	}
	if ( planProduct ) {
		finalCartItems.push( planProduct );
	}

	return finalCartItems;
}

export function useCartForDIFM(
	selectedPages: string[],
	isStoreFlow: boolean
): {
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
	const activePlanScheme = useSelector( ( state ) =>
		getProductBySlug( state, isStoreFlow ? PLAN_BUSINESS : PLAN_PREMIUM )
	);
	const { newOrExistingSiteChoice, siteId, siteSlug } = signupDependencies;
	const isExistingSite = newOrExistingSiteChoice === 'existing-site';
	const isProductsLoading = useSelector( isProductsListFetching );
	const difmLiteProduct = useSelector( ( state ) => getProductBySlug( state, WPCOM_DIFM_LITE ) );
	const userCurrencyCode = useSelector( getCurrentUserCurrencyCode );
	const site = useSelector( ( state ) => getSite( state, siteSlug ?? siteId ) );
	const cartKey = site ? getCartKey( { selectedSite: site } ) : undefined;
	const { replaceProductsInCart, responseCart, isLoading, isPendingUpdate } =
		useShoppingCart( cartKey );

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
				extra: buildDIFMCartExtrasObject(
					{
						...signupDependencies,
						selectedPageTitles: selectedPages,
						isStoreFlow,
					},
					siteSlug
				),
				quantity: selectedPages.length,
			};
		}
		return null;
	}, [ difmLiteProduct, signupDependencies, selectedPages, isStoreFlow, siteSlug ] );

	// [Effect] Loads required initial data
	useEffect( () => {
		if ( ! difmLiteProduct || ! userCurrencyCode ) {
			dispatch( requestProductsList() );
		}
	}, [ dispatch, difmLiteProduct, userCurrencyCode ] );

	// [Effect] Updates flag to show loading feedback to the user on page selection change
	useEffect( () => {
		if ( isExistingSite ) {
			setIsCartUpdateStarted( true );
		}
	}, [ isExistingSite, setIsCartUpdateStarted, selectedPages ] );

	const debouncedReplaceProductsInCart = useMemo(
		() =>
			debounce( async ( products: MinimalRequestCartProduct[] ) => {
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
	if ( difmLiteProduct && activePlanScheme && effectiveCurrencyCode ) {
		if ( isExistingSite ) {
			displayedCartItems = getSiteCartProducts( {
				responseCart,
				translate,
				difmLiteProduct,
			} );
		} else {
			displayedCartItems = getDummyCartProducts( {
				selectedPages,
				currencyCode: effectiveCurrencyCode,
				translate,
				activePlanScheme: activePlanScheme,
				difmLiteProduct,
			} );
		}

		const totalCost = displayedCartItems.reduce(
			( total, currentProduct ) => currentProduct.itemSubTotal + total,
			0
		);
		totalCostFormatted = formatCurrency( totalCost, effectiveCurrencyCode, {
			stripZeros: true,
			isSmallestUnit: true,
		} );
	}
	const isInitialBasketLoaded = displayedCartItems.length > 0;
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
