import {
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
import type { ResponseCartProduct, ResponseCartProductVariant } from '@automattic/shopping-cart';

const debug = debugFactory( 'calypso:composite-checkout:product-variants' );

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
 * using the `filterCallback` argument.
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
		const convertedVariants = variants
			.sort( sortVariant )
			.map( ( variant ): WPCOMProductVariant => {
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

function sortVariant( a: ResponseCartProductVariant, b: ResponseCartProductVariant ) {
	if ( a.bill_period_in_months < b.bill_period_in_months ) {
		return -1;
	}
	if ( a.bill_period_in_months > b.bill_period_in_months ) {
		return 1;
	}
	return 0;
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
