import config from '@automattic/calypso-config';
import {
	getBillingMonthsForTerm,
	getTermDuration,
	getBillingTermForMonths,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_TRIENNIALLY,
	TERM_MONTHLY,
	TERM_QUADRENNIALLY,
	TERM_QUINQUENNIALLY,
	TERM_SEXENNIALLY,
	TERM_SEPTENNIALLY,
	TERM_OCTENNIALLY,
	TERM_NOVENNIALLY,
	TERM_DECENNIALLY,
} from '@automattic/calypso-products';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import { useStableCallback } from 'calypso/lib/use-stable-callback';
import { convertErrorToString } from '../lib/analytics';
import type { WPCOMProductVariant } from '../components/item-variation-picker';
import type { ResponseCartProduct, ResponseCartProductVariant } from '@automattic/shopping-cart';

const debug = debugFactory( 'calypso:composite-checkout:product-variants' );

const isError = ( err: unknown ): err is Error => err instanceof Error;

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
	hasRedeemedDomainCredit?: boolean;
	id: number;
	interval: number;
	introductoryOfferFormattedPrice?: string;
	introductoryOfferRawPrice?: number;
	isDomainUpgrade?: boolean;
	productDisplayPrice?: string;
	productName: string;
	productSlug: string;
	rawDiscount: string;
	rawDiscountInteger: number;
	rawPrice: number;
	rawPriceInteger: number;
	subscribedDate?: string;
	userIsOwner?: boolean;
}

export interface SitesPlansResult {
	data: SitePlanData[] | null;
	hasLoadedFromServer: boolean;
	isRequesting: boolean;
	error: unknown;
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
			.map( ( variant ): WPCOMProductVariant | undefined => {
				try {
					const term = getBillingTermForMonths( variant.bill_period_in_months );
					const introductoryTerms = variant.introductory_offer_terms;
					return {
						variantLabel: {
							noun: getTermText( term, translate, 'noun' ),
							adjective: getTermText( term, translate, 'adjective' ),
						},
						productSlug: variant.product_slug,
						productId: variant.product_id,
						priceInteger: variant.price_integer,
						termIntervalInMonths: getBillingMonthsForTerm( term ),
						termIntervalInDays: getTermDuration( term ) ?? 0,
						introductoryInterval: introductoryTerms?.interval_count,
						introductoryTerm: introductoryTerms?.interval_unit,
						priceBeforeDiscounts: variant.price_before_discounts_integer,
						currency: variant.currency,
						productBillingTermInMonths: variant.bill_period_in_months,
						// Since volume is optional, only add it if it's defined
						...( variant.volume && { volume: variant.volume } ),
					};
				} catch ( error ) {
					// Three-year plans are not yet fully supported, so we need to guard
					// against fatals here and ignore them.
					logToLogstash( {
						feature: 'calypso_client',
						message: 'checkout variant picker variant error',
						severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
						extra: {
							env: config( 'env_id' ),
							variant: JSON.stringify( variant ),
							message: isError( error )
								? convertErrorToString( error )
								: `Unknown error: ${ error }`,
						},
					} );
				}
			} )
			.filter( isValueTruthy );

		return convertedVariants.filter( ( product ) => filterCallbackMemoized( product ) );
	}, [ variants, translate, filterCallbackMemoized ] );

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

function getTermText(
	term: string,
	translate: ReturnType< typeof useTranslate >,
	type: 'noun' | 'adjective' = 'noun'
): string {
	const asAdjective = type === 'adjective';

	switch ( term ) {
		case TERM_DECENNIALLY:
			return String(
				asAdjective
					? translate( 'Ten-year', { context: 'adjective' } )
					: translate( 'Ten years', { context: 'noun' } )
			);

		case TERM_NOVENNIALLY:
			return String(
				asAdjective
					? translate( 'Nine-year', { context: 'adjective' } )
					: translate( 'Nine years', { context: 'noun' } )
			);

		case TERM_OCTENNIALLY:
			return String(
				asAdjective
					? translate( 'Eight-year', { context: 'adjective' } )
					: translate( 'Eight years', { context: 'noun' } )
			);

		case TERM_SEPTENNIALLY:
			return String(
				asAdjective
					? translate( 'Seven-year', { context: 'adjective' } )
					: translate( 'Seven years', { context: 'noun' } )
			);

		case TERM_SEXENNIALLY:
			return String(
				asAdjective
					? translate( 'Six-year', { context: 'adjective' } )
					: translate( 'Six years', { context: 'noun' } )
			);

		case TERM_QUINQUENNIALLY:
			return String(
				asAdjective
					? translate( 'Five-year', { context: 'adjective' } )
					: translate( 'Five years', { context: 'noun' } )
			);

		case TERM_QUADRENNIALLY:
			return String(
				asAdjective
					? translate( 'Four-year', { context: 'adjective' } )
					: translate( 'Four years', { context: 'noun' } )
			);

		case TERM_TRIENNIALLY:
			return String(
				asAdjective
					? translate( 'Three-year', { context: 'adjective' } )
					: translate( 'Three years', { context: 'noun' } )
			);

		case TERM_BIENNIALLY:
			return String(
				asAdjective
					? translate( 'Two-year', { context: 'adjective' } )
					: translate( 'Two years', { context: 'noun' } )
			);

		case TERM_ANNUALLY:
			return String(
				asAdjective
					? translate( 'One-year', { context: 'adjective' } )
					: translate( 'One year', { context: 'noun' } )
			);

		case TERM_MONTHLY:
			return String(
				asAdjective
					? translate( 'One-month', { context: 'adjective' } )
					: translate( 'One month', { context: 'noun' } )
			);

		default:
			return '';
	}
}
