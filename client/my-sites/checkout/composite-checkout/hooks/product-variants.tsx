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
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { requestPlans } from 'calypso/state/plans/actions';
import { requestProductsList } from 'calypso/state/products-list/actions';
import { computeProductsWithPrices } from 'calypso/state/products-list/selectors';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';
import type { WPCOMProductVariant } from '../components/item-variation-picker';
import type { Plan, Product } from '@automattic/calypso-products';
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

export function useGetProductVariants(
	siteId: number | undefined,
	productSlug: string
): WPCOMProductVariant[] {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();

	const sitePlans = useSelector( ( state ) => getPlansBySiteId( state, siteId ) );
	const activePlan = sitePlans?.data?.find( ( plan ) => plan.currentPlan );
	debug( 'activePlan', activePlan );

	const variantProductSlugs = useVariantPlanProductSlugs( productSlug, activePlan?.productSlug );
	debug( 'variantProductSlugs', variantProductSlugs );

	const variantsWithPrices: AvailableProductVariant[] = useSelector( ( state ) => {
		return computeProductsWithPrices( state, siteId, variantProductSlugs );
	} );

	const [ haveFetchedProducts, setHaveFetchedProducts ] = useState( false );
	const shouldFetchProducts = ! variantsWithPrices;

	useEffect( () => {
		if ( shouldFetchProducts && ! haveFetchedProducts ) {
			debug( 'dispatching request for product variant data' );
			reduxDispatch( requestPlans() );
			reduxDispatch( requestProductsList() );
			setHaveFetchedProducts( true );
		}
	}, [ shouldFetchProducts, haveFetchedProducts, reduxDispatch ] );

	const getProductVariantFromAvailableVariant = useCallback(
		( variant: AvailableProductVariant ): WPCOMProductVariant => {
			const price =
				variant.introductoryOfferPrice !== null
					? variant.introductoryOfferPrice
					: variant.priceFinal || variant.priceFull;

			const termIntervalInMonths = getBillingMonthsForTerm( variant.plan.term );
			const pricePerMonth = price / termIntervalInMonths;

			return {
				variantLabel: getTermText( variant.plan.term, translate ),
				productSlug: variant.planSlug,
				productId: variant.product.product_id,
				price,
				termIntervalInMonths: getBillingMonthsForTerm( variant.plan.term ),
				pricePerMonth,
				currency: variant.product.currency_code,
			};
		},
		[ translate ]
	);

	const filteredVariants = useMemo( () => {
		return variantsWithPrices.filter( ( product ) =>
			isVariantAllowed( product, activePlan?.interval )
		);
	}, [ activePlan?.interval, variantsWithPrices ] );

	return useMemo( () => {
		debug( 'found filtered variants', filteredVariants );
		return filteredVariants.map( getProductVariantFromAvailableVariant );
	}, [ getProductVariantFromAvailableVariant, filteredVariants ] );
}

function isVariantAllowed(
	variant: AvailableProductVariant,
	activePlanRenewalInterval: number | undefined
): boolean {
	// Allow the variant when the item added to the cart is not a plan.
	if ( ! isPlan( variant.product ) ) {
		return true;
	}

	// If this is a plan, does the site currently own a plan? If so, is the term
	// of the variant lower than the term of the currently owned plan? If so, do
	// not allow the variant.
	if ( ! activePlanRenewalInterval || activePlanRenewalInterval < 1 ) {
		return true;
	}
	const variantRenewalInterval = getTermDuration( variant.plan.term ) ?? 0;
	if ( activePlanRenewalInterval <= variantRenewalInterval ) {
		return true;
	}
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

function getVariantPlanProductSlugs( productSlug: string | undefined ): string[] {
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

function isVariantOfActivePlan(
	activePlanSlug: string | undefined,
	variantPlanSlug: string
): boolean {
	return getVariantPlanProductSlugs( activePlanSlug ).includes( variantPlanSlug );
}

function useVariantPlanProductSlugs(
	productSlug: string | undefined,
	activePlanSlug: string | undefined
): string[] {
	return useMemo(
		() =>
			getVariantPlanProductSlugs( productSlug ).filter(
				( slug ) => ! isVariantOfActivePlan( activePlanSlug, slug )
			),
		[ productSlug, activePlanSlug ]
	);
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
