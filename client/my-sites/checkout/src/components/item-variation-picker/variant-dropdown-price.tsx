import { isJetpackPlan, isJetpackProduct } from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { hasCheckoutVersion, styled } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { preventWidows } from 'calypso/lib/formatting';
import { getItemVariantDiscountPercentage, getItemVariantCompareToPrice } from './util';
import type { WPCOMProductVariant } from './types';

const Discount = styled.span`
	color: ${ ( props ) => props.theme.colors.discount };
	margin-right: 8px;

	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}

	.item-variant-option--selected & {
		color: #b8e6bf;
	}

	@media ( max-width: 660px ) {
		width: 100%;
	}
`;

const DoNotPayThis = styled.del`
	text-decoration: line-through;
	margin-right: 8px;
	color: #646970;

	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}

	.item-variant-option--selected & {
		color: #fff;
	}
`;

const Price = styled.span`
	display: inline-flex;
	justify-content: right;
	color: #646970;
	.item-variant-option--selected & {
		color: #fff;
	}
`;

const Variant = styled.div`
	align-items: center;
	display: flex;
	font-size: 14px;
	font-weight: 400;
	justify-content: space-between;
	line-height: 20px;
	width: 100%;
	column-gap: 20px;

	.item-variant-option--selected & {
		color: #fff;
	}
`;

const Label = styled.span`
	display: flex;
	white-space: nowrap;
	font-size: ${ hasCheckoutVersion( '2' ) ? '12px' : 'inherit' };
	// MOBILE_BREAKPOINT is <480px, used in useMobileBreakpoint
	@media ( max-width: 480px ) {
		flex-direction: column;
	}
`;

const IntroPricing = styled.span`
	display: flex;
	flex-direction: column;
	font-size: 0.8rem;
`;

const IntroPricingText = styled.span`
	display: block;
	text-align: right;
	margin-bottom: 0rem;
`;

const PriceTextContainer = styled.span`
	text-align: right;
	font-size: ${ hasCheckoutVersion( '2' ) ? '12px' : 'inherit' };
`;

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

export const ItemVariantDropDownPrice: FunctionComponent< {
	variant: WPCOMProductVariant;
	compareTo?: WPCOMProductVariant;
} > = ( { variant, compareTo } ) => {
	const isMobile = useMobileBreakpoint();
	const isJetpack = isJetpackPlan( variant ) || isJetpackProduct( variant );
	const compareToPriceForVariantTerm = getItemVariantCompareToPrice( variant, compareTo );
	const discountPercentage = getItemVariantDiscountPercentage( variant, compareTo );
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
		if (
			( introTerm !== 'month' && introTerm !== 'year' ) ||
			( introCount > 2 && introTerm === 'year' )
		) {
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
			}
			return translate(
				'%(formattedCurrentPrice)s first month then %(formattedPriceBeforeDiscounts)s per month',
				{ args }
			);
			// translation example: $1 first month then $2 per month

			// multiple period introductory offers (eg 3 months) there are no multi-year introductory offers
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
				return translate(
					'%(formattedCurrentPrice)s first %(introCount)s months then %(formattedPriceBeforeDiscounts)s per year',
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
	const canDisplayDiscountPercentage = ! isIntroductoryOffer || ( isJetpack && introCount >= 1 );

	return (
		<Variant>
			<Label>
				{ variant.variantLabel }
				{ hasDiscount && ! isJetpack && isMobile && (
					<DiscountPercentage percent={ discountPercentage } />
				) }
			</Label>
			<PriceTextContainer>
				{ hasDiscount && ! isMobile && canDisplayDiscountPercentage && (
					<DiscountPercentage percent={ discountPercentage } />
				) }
				{ ! hasCheckoutVersion( '2' ) && hasDiscount && ! isIntroductoryOffer && ! isJetpack && (
					<DoNotPayThis>{ formattedCompareToPriceForVariantTerm }</DoNotPayThis>
				) }
				{ ! hasCheckoutVersion( '2' ) && (
					<Price aria-hidden={ isIntroductoryOffer }>{ formattedCurrentPrice }</Price>
				) }
				<IntroPricing>
					<IntroPricingText>
						{ isIntroductoryOffer && translatedIntroOfferDetails() }
					</IntroPricingText>
				</IntroPricing>
			</PriceTextContainer>
		</Variant>
	);
};
