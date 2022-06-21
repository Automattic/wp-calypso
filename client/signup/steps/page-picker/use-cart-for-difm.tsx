import { isEnabled } from '@automattic/calypso-config';
import {
	PLAN_PREMIUM,
	PLAN_WPCOM_PRO,
	WPCOM_DIFM_EXTRA_PAGE,
	WPCOM_DIFM_LITE,
} from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { useShoppingCart } from '@automattic/shopping-cart';
import { LocalizeProps, useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { buildDIFMCartExtrasObject } from 'calypso/state/difm/assemblers';
import { requestProductsList } from 'calypso/state/products-list/actions';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { fetchSitePlans } from 'calypso/state/sites/plans/actions';
import { getSiteId } from 'calypso/state/sites/selectors';
import type {
	MinimalRequestCartProduct,
	ResponseCart,
	ResponseCartProduct,
} from '@automattic/shopping-cart';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
import type { TranslateResult } from 'i18n-calypso';

export type CartItem = {
	nameOverride?: TranslateResult;
	product:
		| ( Partial< ProductListItem > & Pick< ProductListItem, 'cost' | 'product_name' > )
		| ( Partial< ResponseCartProduct > & Pick< ResponseCartProduct, 'cost' | 'product_name' > );
	meta?: TranslateResult;
	productCount?: number;
	lineCost: number;
};

const FREE_PAGES = 5;

type DummyCartParams = {
	selectedPages: string[];
	currencyCode: string;
	activePlanScheme: ProductListItem | null;
	difmLiteProduct: ProductListItem | null;
	extraPageProduct: ProductListItem | null;
	translate: LocalizeProps[ 'translate' ];
	formatCurrency: ( original: number, currrency: string ) => string | null;
};

function getDummyCartProducts( {
	selectedPages,
	currencyCode,
	activePlanScheme,
	difmLiteProduct,
	extraPageProduct,
	translate,
	formatCurrency,
}: DummyCartParams ): CartItem[] {
	const extraPageCount = Math.max( 0, selectedPages.length - FREE_PAGES );
	let displayedCartItems: CartItem[] = [];
	if ( difmLiteProduct && activePlanScheme && extraPageProduct ) {
		displayedCartItems = [
			{
				nameOverride: translate( 'Website Design Service' ),
				product: difmLiteProduct,
				lineCost: difmLiteProduct.cost,
				meta: translate( 'One-time fee' ),
			},
			{
				product: activePlanScheme,
				meta: translate( 'Plan Subscription: %(planPrice)s per year', {
					args: { planPrice: formatCurrency( activePlanScheme.cost, currencyCode ) },
				} ),
				lineCost: activePlanScheme.cost,
			},

			{
				nameOverride: `${ extraPageCount } ${
					extraPageCount === 1 ? translate( 'Extra Page' ) : translate( 'Extra Pages' )
				}`,
				product: extraPageProduct,
				meta: translate( '%(perPageCost)s Per Page', {
					args: {
						perPageCost: extraPageProduct.cost_display,
					},
				} ),
				lineCost: extraPageProduct.cost * extraPageCount,
				productCount: extraPageCount,
			},
		];
	}

	return displayedCartItems;
}

function getSiteCartProducts( {
	responseCart,
	translate,
}: {
	responseCart: ResponseCart;
	translate: LocalizeProps[ 'translate' ];
} ): CartItem[] {
	return responseCart.products.map( ( product ) => {
		switch ( product.product_slug ) {
			case PLAN_WPCOM_PRO:
				return {
					product: product,
					lineCost: product.cost,
					meta: translate( 'Plan Subscription: %(planPrice)s per year', {
						args: { planPrice: product.product_cost_display },
					} ),
				};
			case WPCOM_DIFM_LITE:
				return {
					nameOverride: 'Website Design Service',
					product: product,
					lineCost: product.cost,
					meta: translate( 'One-time fee' ),
				};
			case WPCOM_DIFM_EXTRA_PAGE:
				return {
					nameOverride: `${ product.quantity } ${
						product.quantity === 1 ? translate( 'Extra Page' ) : translate( 'Extra Pages' )
					}`,
					product: product,
					lineCost: product.cost,
					meta: product.item_original_cost_for_quantity_one_display + ' ' + translate( 'Per Page' ),
				};

			default:
				return {
					nameOverride: 'Website Design Service',
					product: product,
					lineCost: product.cost,
					meta: translate( 'One-time fee' ),
				};
		}
	} );
}

export function useCartForDIFM( selectedPages: string[] ): {
	items: CartItem[];
	total: string | null;
	isCartLoading: boolean;
} {
	const signupDependencies = useSelector( getSignupDependencyStore );
	const { newOrExistingSiteChoice, siteId, siteSlug } = signupDependencies;

	const translate = useTranslate();
	const dispatch = useDispatch();
	const proPlan = useSelector( ( state ) => getProductBySlug( state, PLAN_WPCOM_PRO ) );
	const premiumPlan = useSelector( ( state ) => getProductBySlug( state, PLAN_PREMIUM ) );
	const activePremiumPlanScheme = isEnabled( 'plans/pro-plan' ) ? proPlan : premiumPlan;

	const extraPageProduct = useSelector( ( state ) =>
		getProductBySlug( state, WPCOM_DIFM_EXTRA_PAGE )
	);
	const difmLiteProduct = useSelector( ( state ) => getProductBySlug( state, WPCOM_DIFM_LITE ) );

	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	const cartKey = useSelector( ( state ) => getSiteId( state, siteSlug ?? siteId ) );
	const { replaceProductsInCart, responseCart, isLoading, isPendingUpdate } = useShoppingCart(
		cartKey ?? undefined
	);

	const difmExtra = useCallback(
		() =>
			buildDIFMCartExtrasObject( {
				...signupDependencies,
				selectedPageTitles: selectedPages,
			} ),
		[ signupDependencies, selectedPages ]
	);

	useEffect( () => {
		siteId && dispatch( fetchSitePlans( siteId ) );
		dispatch( requestProductsList() );
	}, [ dispatch, siteId ] );

	useEffect( () => {
		if ( newOrExistingSiteChoice === 'existing-site' ) {
			const productsToAdd: MinimalRequestCartProduct[] = [];
			if ( difmLiteProduct && difmLiteProduct.product_slug ) {
				productsToAdd.push( {
					...difmLiteProduct,
					extra: difmExtra(),
				} );
			}

			replaceProductsInCart( productsToAdd );
		}
	}, [
		activePremiumPlanScheme,
		difmLiteProduct,
		newOrExistingSiteChoice,
		replaceProductsInCart,
		difmExtra,
	] );

	let displayedCartItems: CartItem[] = [];
	if ( newOrExistingSiteChoice === 'existing-site' ) {
		displayedCartItems = getSiteCartProducts( { responseCart, translate } );
	} else {
		displayedCartItems = getDummyCartProducts( {
			selectedPages,
			currencyCode: currencyCode ?? 'USD',
			formatCurrency,
			translate,
			activePlanScheme: activePremiumPlanScheme,
			difmLiteProduct,
			extraPageProduct,
		} );
	}

	const totalCost = displayedCartItems.reduce(
		( total, currentProduct ) => currentProduct.lineCost + total,
		0
	);
	const totalCostFormatted = formatCurrency( totalCost, currencyCode ?? 'USD', { precision: 0 } );

	return {
		items: displayedCartItems,
		total: totalCostFormatted,
		isCartLoading: isLoading || isPendingUpdate || currencyCode === null,
	};
}

export default useCartForDIFM;
