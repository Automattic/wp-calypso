import { isMultiYearDomainProduct } from '@automattic/calypso-products';
import colorStudio from '@automattic/color-studio';
import { formatCurrency } from '@automattic/number-formatters';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { preventWidows } from 'calypso/lib/formatting';
import {
	Discount,
	DiscountAbsolute,
	DoNotPayThis,
	IntroPricing,
	IntroPricingText,
	Label,
	Price,
	PriceTextContainer,
	Variant,
} from './styles';
import { getItemVariantDiscount, getItemVariantCompareToPrice } from './util';
import type { WPCOMProductVariant } from './types';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

const DiscountPercentage: FunctionComponent< { percent: number } > = ( { percent } ) => {
	const translate = useTranslate();
	return (
		<Discount>
			{ translate( 'Save %(percent)s%%', {
				args: {
					percent,
				},
			} ) }
		</Discount>
	);
};

const DiscountPrice: FunctionComponent< {
	price: string;
	termIntervalInMonths: number;
} > = ( { price, termIntervalInMonths } ) => {
	const translate = useTranslate();

	// Determine colors for DiscountAbsolute based on term
	let discountColor = colorStudio.colors[ 'Green 80' ];
	let discountBackgroundColor = colorStudio.colors[ 'Green 10' ];

	if ( termIntervalInMonths === 12 ) {
		discountColor = colorStudio.colors[ 'Green 50' ];
		discountBackgroundColor = colorStudio.colors[ 'Green 0' ]; // As per original request for yearly
	} else if ( termIntervalInMonths === 24 ) {
		discountColor = colorStudio.colors[ 'Green 80' ];
		discountBackgroundColor = colorStudio.colors[ 'Green 5' ]; // As per original request for 2-yearly (using Green 5 as "Green" is ambiguous)
	}

	return (
		<DiscountAbsolute color={ discountColor } backgroundColor={ discountBackgroundColor }>
			{ translate( 'Save %(price)s', { args: { price } } ) }
		</DiscountAbsolute>
	);
};

export const ItemVariantDropDownPrice: FunctionComponent< {
	variant: WPCOMProductVariant;
	compareTo?: WPCOMProductVariant;
	product: ResponseCartProduct;
	isStreamlinedPrice?: boolean;
} > = ( { variant, compareTo, product, isStreamlinedPrice } ) => {
	const isMobile = useMobileBreakpoint();
	const compareToPriceForVariantTerm = getItemVariantCompareToPrice( variant, compareTo );
	const discountPercentage = getItemVariantDiscount( variant, compareTo );
	const discount = formatCurrency(
		getItemVariantDiscount( variant, compareTo, 'absolute' ),
		variant.currency,
		{
			stripZeros: true,
			isSmallestUnit: true,
		}
	);

	const formattedCurrentPrice = formatCurrency( variant.priceInteger, variant.currency, {
		stripZeros: true,
		isSmallestUnit: true,
	} );
	const formattedCompareToPriceForVariantTerm = compareToPriceForVariantTerm
		? formatCurrency( compareToPriceForVariantTerm, variant.currency, {
				stripZeros: true,
				isSmallestUnit: true,
		  } )
		: undefined;
	// Introductory offer variables
	const introTerm = variant.introductoryTerm;
	const introCount = variant.introductoryInterval;
	const formattedPriceBeforeDiscounts = formatCurrency(
		variant.priceBeforeDiscounts,
		variant.currency,
		{
			stripZeros: true,
			isSmallestUnit: true,
		}
	);
	const productBillingTermInMonths = variant.productBillingTermInMonths;
	const isIntroductoryOffer = introCount > 0;
	const translate = useTranslate();
	const isMultiYearDomain = isMultiYearDomainProduct( product );

	const translatedIntroOfferDetails = () => {
		const args = {
			formattedCurrentPrice,
			formattedPriceBeforeDiscounts,
			introCount,
		};
		// Add billing term in years for multi-year plans. (Only to be used when productBillingTermInMonths > 12)
		const multiYearArgs = {
			...args,
			billingTermInYears: productBillingTermInMonths / 12,
		};

		//generic introductory offer to catch unexpected offer terms
		if ( introTerm !== 'month' && introTerm !== 'year' ) {
			return translate( '%(formattedCurrentPrice)s introductory offer', { args } );
			// translation example: $1 introductory offer
		}

		// mobile display for introductory offers
		else if ( isMobile ) {
			if ( introCount === 1 ) {
				return introTerm === 'month'
					? translate( '%(formattedCurrentPrice)s first month', { args } )
					: translate( '%(formattedCurrentPrice)s first year', { args } );
				// translation example: $1 first month
			}
			return introTerm === 'month'
				? translate( '%(formattedCurrentPrice)s first %(introCount)s months', { args } )
				: translate( '%(formattedCurrentPrice)s first %(introCount)s years', { args } );
			// translation example: $1 first 3 months
		}

		// single period introductory offers (eg 1 month)
		else if ( introCount === 1 ) {
			if ( productBillingTermInMonths > 12 ) {
				return introTerm === 'month'
					? translate(
							'%(formattedCurrentPrice)s first month then %(formattedPriceBeforeDiscounts)s per %(billingTermInYears)s years',
							{ args: multiYearArgs }
					  )
					: translate(
							'%(formattedCurrentPrice)s first year then %(formattedPriceBeforeDiscounts)s per %(billingTermInYears)s years',
							{ args: multiYearArgs }
					  );
				// translation example: $1 first month then $2 per 2 years
			} else if ( productBillingTermInMonths === 12 ) {
				return introTerm === 'month'
					? translate(
							'%(formattedCurrentPrice)s first month then %(formattedPriceBeforeDiscounts)s per year',
							{ args }
					  )
					: translate(
							'%(formattedCurrentPrice)s first year then %(formattedPriceBeforeDiscounts)s per year',
							{ args }
					  );
				// translation example: $1 first month then $2 per year
			} else if ( productBillingTermInMonths === 1 && introTerm === 'year' ) {
				return translate(
					'%(formattedCurrentPrice)s first year then %(formattedPriceBeforeDiscounts)s per month',
					{ args }
				);
			}
			return translate(
				'%(formattedCurrentPrice)s first month then %(formattedPriceBeforeDiscounts)s per month',
				{ args }
			);
			// translation example: $1 first month then $2 per month

			// multiple period introductory offers (eg 3 months)
		} else if ( introCount > 1 ) {
			if ( productBillingTermInMonths > 12 ) {
				return introTerm === 'month'
					? preventWidows(
							translate(
								'%(formattedCurrentPrice)s first %(introCount)s months then %(formattedPriceBeforeDiscounts)s per %(billingTermInYears)s years',
								{ args: multiYearArgs }
							)
					  )
					: preventWidows(
							translate(
								'%(formattedCurrentPrice)s for first %(introCount)s years then %(formattedPriceBeforeDiscounts)s per %(billingTermInYears)s years',
								{ args: multiYearArgs }
							)
					  );
				// translation example: $1 first 3 months then $2 per 2 years
			} else if ( productBillingTermInMonths === 12 ) {
				return introTerm === 'month'
					? translate(
							'%(formattedCurrentPrice)s first %(introCount)s months then %(formattedPriceBeforeDiscounts)s per year',
							{ args }
					  )
					: translate(
							'%(formattedCurrentPrice)s first %(introCount)s years then %(formattedPriceBeforeDiscounts)s per year',
							{ args }
					  );
			} else if ( productBillingTermInMonths === 1 && introTerm === 'year' ) {
				return translate(
					'%(formattedCurrentPrice)s first %(introCount)s years then %(formattedPriceBeforeDiscounts)s per month',
					{ args }
				);
				// translation example: $1 first 3 months then $2 per year
			}
			return translate(
				'%(formattedCurrentPrice)s first %(introCount)s months then %(formattedPriceBeforeDiscounts)s per month',
				{ args }
			);
			// translation example: $1 first 3 months then $2 per month
		}
	};

	const hasDiscount = discountPercentage > 0;
	// Display the discount percentage if it's not an introductory offer
	// or if it's a Jetpack 2 or 3-year plan
	const canDisplayDiscountPercentage = ! isIntroductoryOffer;

	const label =
		variant.termIntervalInMonths === 1 && isStreamlinedPrice
			? translate( 'Month' )
			: variant.variantLabel.noun;

	return (
		<Variant>
			<Label>
				{ label }
				{ hasDiscount &&
					isMobile &&
					( isStreamlinedPrice ? (
						<DiscountPrice
							price={ discount }
							termIntervalInMonths={ variant.termIntervalInMonths }
						/>
					) : (
						<DiscountPercentage percent={ discountPercentage } />
					) ) }
			</Label>
			<PriceTextContainer>
				{ hasDiscount &&
					! isMobile &&
					canDisplayDiscountPercentage &&
					( isStreamlinedPrice ? (
						<DiscountPrice
							price={ discount }
							termIntervalInMonths={ variant.termIntervalInMonths }
						/>
					) : (
						<DiscountPercentage percent={ discountPercentage } />
					) ) }
				{ hasDiscount && ! isIntroductoryOffer && ! isStreamlinedPrice && (
					<DoNotPayThis>{ formattedCompareToPriceForVariantTerm }</DoNotPayThis>
				) }

				{ isStreamlinedPrice ? (
					! canDisplayDiscountPercentage && (
						<DiscountPrice
							price={ discount }
							termIntervalInMonths={ variant.termIntervalInMonths }
						/>
					)
				) : (
					<Price aria-hidden={ isIntroductoryOffer }>{ formattedCurrentPrice }</Price>
				) }
				{ ! isStreamlinedPrice && (
					<IntroPricing>
						{ ! isMultiYearDomain && (
							<IntroPricingText>
								{ isIntroductoryOffer && translatedIntroOfferDetails() }
							</IntroPricingText>
						) }
					</IntroPricing>
				) }
			</PriceTextContainer>
		</Variant>
	);
};
