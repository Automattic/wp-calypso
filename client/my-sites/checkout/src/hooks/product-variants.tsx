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
import { useCheckoutV2 } from './use-checkout-v2';
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
	const shouldUseCheckoutV2 = useCheckoutV2() === 'treatment';
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
						variantLabel: getTermText( term, translate, shouldUseCheckoutV2 ),
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
	}, [ variants, translate, shouldUseCheckoutV2, filterCallbackMemoized ] );

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
	shouldUseCheckoutV2: boolean
): string {
	switch ( term ) {
		case TERM_DECENNIALLY:
			return String(
				! shouldUseCheckoutV2 ? translate( 'Ten years' ) : translate( 'Billed every ten years' )
			);

		case TERM_NOVENNIALLY:
			return String(
				! shouldUseCheckoutV2 ? translate( 'Nine years' ) : translate( 'Billed every nine years' )
			);

		case TERM_OCTENNIALLY:
			return String(
				! shouldUseCheckoutV2 ? translate( 'Eight years' ) : translate( 'Billed every eight years' )
			);

		case TERM_SEPTENNIALLY:
			return String(
				! shouldUseCheckoutV2 ? translate( 'Seven years' ) : translate( 'Billed every seven years' )
			);

		case TERM_SEXENNIALLY:
			return String(
				! shouldUseCheckoutV2 ? translate( 'Six years' ) : translate( 'Billed every six years' )
			);

		case TERM_QUINQUENNIALLY:
			return String(
				! shouldUseCheckoutV2 ? translate( 'Five years' ) : translate( 'Billed every five years' )
			);

		case TERM_QUADRENNIALLY:
			return String(
				! shouldUseCheckoutV2 ? translate( 'Four years' ) : translate( 'Billed every four years' )
			);

		case TERM_TRIENNIALLY:
			return String(
				! shouldUseCheckoutV2 ? translate( 'Three years' ) : translate( 'Billed every three years' )
			);

		case TERM_BIENNIALLY:
			return String(
				! shouldUseCheckoutV2 ? translate( 'Two years' ) : translate( 'Billed every two years' )
			);

		case TERM_ANNUALLY:
			return String(
				! shouldUseCheckoutV2 ? translate( 'One year' ) : translate( 'Billed every one year' )
			);

		case TERM_MONTHLY:
			return String(
				! shouldUseCheckoutV2 ? translate( 'One month' ) : translate( 'Billed every month' )
			);

		default:
			return '';
	}
}
