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
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import formatCurrency, { CURRENCIES } from '@automattic/format-currency';
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

const debug = debugFactory( 'calypso:composite-checkout:product-variants' );

function myFormatCurrency( price: number, code: string, options = {} ) {
	const precision = CURRENCIES[ code ].precision;
	const EPSILON = Math.pow( 10, -precision ) - 0.000000001;

	const hasCents = Math.abs( price % 1 ) >= EPSILON;
	return formatCurrency( price, code, hasCents ? options : { ...options, precision: 0 } );
}

export interface AvailableProductVariant {
	planSlug: string;
	plan: Plan | Product;
	product: {
		product_id: number;
		currency_code: string;
	};
	priceFull: number;
	priceFinal: number;
	introductoryOfferPrice: number | null;
}

export interface AvailableProductVariantAndCompared extends AvailableProductVariant {
	priceFullBeforeDiscount: number;
}

export interface SitePlanData {
	currentPlan: boolean;
	interval: number;
	productSlug: string;
}

interface SitesPlansResult {
	data: SitePlanData[];
}

export function useGetProductVariants(
	siteId: number | undefined,
	productSlug: string
): WPCOMProductVariant[] {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();

	const sitePlans: SitesPlansResult | null = useSelector( ( state ) =>
		siteId ? getPlansBySiteId( state, siteId ) : null
	);
	const activePlan: SitePlanData | undefined = sitePlans?.data?.find(
		( plan ) => plan.currentPlan
	);
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
		( variant: AvailableProductVariantAndCompared ): WPCOMProductVariant => {
			const currentPrice =
				variant.introductoryOfferPrice !== null
					? variant.introductoryOfferPrice
					: variant.priceFinal || variant.priceFull;
			// extremely low "discounts" are possible if the price of the longer term has been rounded
			// if they cannot be rounded to at least a percentage point we should not show them
			const discountPercentage = Math.floor(
				100 - ( currentPrice / variant.priceFullBeforeDiscount ) * 100
			);

			return {
				variantLabel: getTermText( variant.plan.term, translate ),
				productSlug: variant.planSlug,
				productId: variant.product.product_id,
				discountPercentage,
				formattedPriceBeforeDiscount: myFormatCurrency(
					variant.priceFullBeforeDiscount,
					variant.product.currency_code
				),
				formattedCurrentPrice: myFormatCurrency( currentPrice, variant.product.currency_code ),
			};
		},
		[ translate ]
	);

	const filteredVariants = useMemo( () => {
		return variantsWithPrices.filter( ( product ) =>
			isVariantAllowed( product, activePlan?.interval )
		);
	}, [ activePlan?.interval, variantsWithPrices ] );

	const variantsWithComparativeDiscounts = useMemo(
		() => addComparativeDiscountsToVariants( filteredVariants ),
		[ filteredVariants ]
	);

	return useMemo( () => {
		debug( 'found filtered variants', variantsWithComparativeDiscounts );
		return variantsWithComparativeDiscounts.map( getProductVariantFromAvailableVariant );
	}, [ getProductVariantFromAvailableVariant, variantsWithComparativeDiscounts ] );
}

function addComparativeDiscountsToVariants(
	variants: AvailableProductVariant[]
): AvailableProductVariantAndCompared[] {
	return variants.map( ( variant ) => {
		return {
			...variant,
			priceFullBeforeDiscount: getLowestPriceTimesVariantInterval( variant, variants ),
		};
	} );
}

function getLowestPriceTimesVariantInterval(
	variant: AvailableProductVariant,
	allVariants: AvailableProductVariant[]
): number {
	if ( allVariants.length < 1 ) {
		throw new Error(
			'There must be at least one variant to compare against when generating relative prices'
		);
	}

	allVariants.sort( ( variantA, variantB ) => {
		const variantAInterval = getTermDuration( variantA.plan.term ) ?? 0;
		const variantBInterval = getTermDuration( variantB.plan.term ) ?? 0;
		return variantAInterval - variantBInterval;
	} );
	const lowestVariant = allVariants[ 0 ];

	const monthsInVariant = getBillingMonthsForTerm( variant.plan.term );
	const monthsInLowestVariant = getBillingMonthsForTerm( lowestVariant.plan.term );
	const lowestVariantIntervalsInVariantTerm = Math.round( monthsInVariant / monthsInLowestVariant );

	return lowestVariant.priceFull * lowestVariantIntervalsInVariantTerm;
}

function isVariantAllowed(
	variant: AvailableProductVariant,
	activePlanRenewalInterval: number | undefined
): boolean {
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
