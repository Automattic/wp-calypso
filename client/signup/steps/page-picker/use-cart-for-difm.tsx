import {
	PLAN_PREMIUM,
	WPCOM_DIFM_LITE,
	getDIFMTieredPriceDetails,
	PLAN_BUSINESS,
	isPremium,
	isBusiness,
	isEcommerce,
	isPro,
} from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/number-formatters';
import { LocalizeProps, useTranslate, TranslateResult } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { requestProductsList } from 'calypso/state/products-list/actions';
import { getProductBySlug, isProductsListFetching } from 'calypso/state/products-list/selectors';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

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
	currentPlanSlug?: string | null;
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

const hasHigherPlan = ( currentPlanSlug: string, plan: string ) => {
	const planMatchers =
		plan === PLAN_PREMIUM
			? [ isPremium, isBusiness, isEcommerce, isPro ]
			: [ isBusiness, isEcommerce, isPro ];

	return planMatchers.some( ( planMatcher ) =>
		planMatcher( {
			productSlug: currentPlanSlug,
		} )
	);
};

function getDummyCartProducts( {
	selectedPages,
	currencyCode,
	activePlanScheme,
	difmLiteProduct,
	translate,
	currentPlanSlug,
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
		];

		if (
			! currentPlanSlug ||
			( currentPlanSlug && ! hasHigherPlan( currentPlanSlug, activePlanScheme.product_slug ) )
		) {
			displayedCartItems.push( {
				productSlug: activePlanScheme.product_slug,
				productOriginalName: activePlanScheme.product_name,
				itemSubTotal: activePlanScheme.cost_smallest_unit,
				productDisplayCost:
					formatCurrency( activePlanScheme.cost_smallest_unit, currencyCode, {
						isSmallestUnit: true,
						stripZeros: true,
					} ) + '*',
				subLabel: translate( 'Plan Subscription: %(planPrice)s per year', {
					args: {
						planPrice: formatCurrency( activePlanScheme.cost_smallest_unit, currencyCode, {
							isSmallestUnit: true,
							stripZeros: true,
						} ),
					},
				} ),
			} );
		}
	}

	return displayedCartItems;
}

export function useCartForDIFM( {
	selectedPages,
	isStoreFlow,
	currentPlanSlug,
}: {
	selectedPages: string[];
	isStoreFlow: boolean;
	currentPlanSlug?: string | null;
} ): {
	items: CartItem[];
	total: string | null;
	isProductsLoading: boolean;
} {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const activePlanScheme = useSelector( ( state ) =>
		getProductBySlug( state, isStoreFlow ? PLAN_BUSINESS : PLAN_PREMIUM )
	);
	const isProductsLoading = useSelector( isProductsListFetching );
	const difmLiteProduct = useSelector( ( state ) => getProductBySlug( state, WPCOM_DIFM_LITE ) );
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) || '';

	// [Effect] Loads required initial data
	useEffect( () => {
		if ( ! difmLiteProduct || ! currencyCode ) {
			const query = {
				type: 'partial',
				product_slugs: [ WPCOM_DIFM_LITE, PLAN_BUSINESS, PLAN_PREMIUM ],
			};
			dispatch( requestProductsList( query ) );
		}
	}, [ dispatch, difmLiteProduct, currencyCode ] );

	let displayedCartItems: CartItem[] = [];
	let totalCostFormatted = null;
	if ( difmLiteProduct && activePlanScheme && currencyCode ) {
		displayedCartItems = getDummyCartProducts( {
			selectedPages,
			currencyCode,
			translate,
			activePlanScheme: activePlanScheme,
			difmLiteProduct,
			currentPlanSlug,
		} );

		const totalCost = displayedCartItems.reduce(
			( total, currentProduct ) => currentProduct.itemSubTotal + total,
			0
		);
		totalCostFormatted = formatCurrency( totalCost, currencyCode, {
			stripZeros: true,
			isSmallestUnit: true,
		} );
	}
	return {
		items: displayedCartItems,
		total: totalCostFormatted,
		isProductsLoading,
	};
}

export default useCartForDIFM;
