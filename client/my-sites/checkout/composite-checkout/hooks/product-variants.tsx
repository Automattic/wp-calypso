import {
	isPlan,
	findPlansKeys,
	findProductKeys,
	getBillingMonthsForTerm,
	getPlan,
	getProductFromSlug,
	getTermDuration,
	GROUP_JETPACK,
	GROUP_WPCOM,
	objectIsProduct,
	getBillingTermForMonths,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useStableCallback } from 'calypso/lib/use-stable-callback';
import type { WPCOMProductVariant } from '../components/item-variation-picker';
import type { Plan, Product } from '@automattic/calypso-products';
import type { ResponseCartProduct, ResponseCartProductVariant } from '@automattic/shopping-cart';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

const debug = debugFactory( 'calypso:composite-checkout:product-variants' );

export interface AvailableProductVariant {
	planSlug: string;
	plan: Plan | Product;
	product: ProductListItem;
	priceFull: number;
	priceFinal: number;
	introductoryOfferPrice: number | null;
}

export interface AvailableProductVariantAndCompared extends AvailableProductVariant {
	priceFullBeforeDiscount: number;
}

export interface SitePlanData {
	autoRenew?: boolean;
	autoRenewDate?: string;
	canStartTrial?: boolean;
	currencyCode: string;
	currentPlan?: boolean;
	discountReason?: string | null;
	expiry?: string;
	expiryDate?: string;
	formattedDiscount: string;
	formattedOriginalPrice: string;
	formattedPrice: string;
	freeTrial?: boolean;
	hasDomainCredit?: boolean;
	id: number;
	interval: number;
	introductoryOfferFormattedPrice?: string;
	introductoryOfferRawPrice?: number;
	isDomainUpgrade?: boolean;
	productDisplayPrice?: string;
	productName: string;
	productSlug: string;
	rawDiscount: string;
	rawPrice: number;
	subscribedDate?: string;
	userIsOwner?: boolean;
}

export interface SitesPlansResult {
	data: SitePlanData[] | null;
}

export type VariantFilterCallback = ( variant: WPCOMProductVariant ) => boolean;

const fallbackFilter = () => true;
const fallbackVariants: ResponseCartProductVariant[] = [];

/**
 * Return all product variants for a particular product.
 *
 * This will return all available variants but you probably want to filter them
 * using the `filterCallback` argument. Consider using `canVariantBePurchased` as
 * the filter if you are using this for a new purchase.
 *
 * `filterCallback` can safely be an anonymous function without causing
 * identity stability issues (no need to use `useMemo` or `useCallback`).
 *
 * `filterCallback` gets two arguments: the first is a variant and the second
 * is the term interval of the currently active plan, if any.
 */
export function useGetProductVariants(
	product: ResponseCartProduct | undefined,
	filterCallback?: VariantFilterCallback
): WPCOMProductVariant[] {
	const translate = useTranslate();
	const filterCallbackMemoized = useStableCallback( filterCallback ?? fallbackFilter );

	const variants = product?.product_variants ?? fallbackVariants;
	const variantProductSlugs = variants.map( ( variant ) => variant.product_slug );
	debug( 'variantProductSlugs', variantProductSlugs );

	const filteredVariants = useMemo( () => {
		const convertedVariants = variants.map( ( variant ): WPCOMProductVariant => {
			const term = getBillingTermForMonths( variant.bill_period_in_months );
			return {
				variantLabel: getTermText( term, translate ),
				productSlug: variant.product_slug,
				productId: variant.product_id,
				priceInteger: variant.price_integer,
				termIntervalInMonths: getBillingMonthsForTerm( term ),
				termIntervalInDays: getTermDuration( term ) ?? 0,
				currency: variant.currency,
			};
		} );

		return convertedVariants.filter( ( product ) => filterCallbackMemoized( product ) );
	}, [ translate, variants, filterCallbackMemoized ] );

	return filteredVariants;
}

export function canVariantBePurchased(
	variant: WPCOMProductVariant,
	activePlanRenewalInterval: number | undefined,
	activePlanSlug: string | undefined
): boolean {
	// Always allow the variant when the item added to the cart is not a plan.
	if ( ! isPlan( variant ) ) {
		return true;
	}

	// If the variant is a plan and there is no active plan, always allow the variant.
	if ( ! activePlanRenewalInterval || activePlanRenewalInterval < 1 ) {
		return true;
	}

	// If the variant is a plan and the site has an active plan, only allow the
	// variant if the term of the variant is longer than the term of the active
	// plan. This is because our backend does not support plan upgrades which are
	// term downgrades.
	const variantRenewalInterval = variant.termIntervalInDays;
	if ( activePlanRenewalInterval > variantRenewalInterval ) {
		debug(
			'filtering out plan variant',
			variant,
			'with interval',
			variantRenewalInterval,
			'because it is a downgrade from',
			activePlanRenewalInterval
		);
		return false;
	}

	// If the variant is a plan and the site has an active plan, only allow the
	// variant it is not a variant of the active plan. In other words, do not
	// show the variant picker when purchasing a term upgrade for the active
	// plan. This is because such a case is already an upsell and does not
	// benefit from a term picker.
	if ( getVariantPlanProductSlugs( activePlanSlug ).includes( variant.productSlug ) ) {
		return false;
	}

	return true;
}

export function getVariantPlanProductSlugs( productSlug: string | undefined ): string[] {
	const chosenPlan = getPlan( productSlug ?? '' )
		? getPlan( productSlug ?? '' )
		: getProductFromSlug( productSlug ?? '' );

	if ( ! chosenPlan || typeof chosenPlan === 'string' ) {
		return [];
	}

	// Only construct variants for WP.com and Jetpack plans
	if (
		! objectIsProduct( chosenPlan ) &&
		chosenPlan.group !== GROUP_WPCOM &&
		chosenPlan.group !== GROUP_JETPACK
	) {
		return [];
	}

	return objectIsProduct( chosenPlan )
		? findProductKeys( {
				type: chosenPlan.type,
		  } )
		: findPlansKeys( {
				group: chosenPlan.group,
				type: chosenPlan.type,
		  } );
}

function getTermText( term: string, translate: ReturnType< typeof useTranslate > ): string {
	switch ( term ) {
		case TERM_BIENNIALLY:
			return String( translate( 'Two years' ) );

		case TERM_ANNUALLY:
			return String( translate( 'One year' ) );

		case TERM_MONTHLY:
			return String( translate( 'One month' ) );
		default:
			return '';
	}
}
