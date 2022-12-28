import formatCurrency from '@automattic/format-currency';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { styled } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
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
	display: flex;
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
	column-gap: 10%;

	.item-variant-option--selected & {
		color: #fff;
	}
`;

const Label = styled.span`
	display: flex;
	// MOBILE_BREAKPOINT is <480px, used in useMobileBreakpoint
	@media ( max-width: 480px ) {
		flex-direction: column;
	}
`;

const IntroPricing = styled.span`
	display: flex;
	flex-direction: column;
	font-size: 0.8rem;
	.div {
		display: block;
		margin-bottom: 0rem;
	}
`;

const IntroPricingText = styled.span`
	display: block;
	text-align: right;
	margin-bottom: 0rem;
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
	const billingTermInYears = () => {
		if ( productBillingTermInMonths > 12 ) {
			return productBillingTermInMonths / 12;
		}
		return null;
	};

	const translatedIntroOfferDetails = () => {
		const args = {
			formattedCurrentPrice,
			formattedPriceBeforeDiscounts,
			billingTermInYears: billingTermInYears(),
			introCount,
		};
		//generic introductory offer to catch unexpected offer terms
		if (
			( introTerm !== 'month' && introTerm !== 'year' ) ||
			( introCount > 1 && introTerm === 'year' )
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
			return translate( '%(formattedCurrentPrice)s first %(introCount)s months', { args } );
			// translation example: $1 first 3 months
		}

		// single period introductory offers (eg 1 month)
		else if ( introCount === 1 ) {
			if ( productBillingTermInMonths > 12 ) {
				return introTerm === 'month'
					? translate(
							'%(formattedCurrentPrice)s first month then %(formattedPriceBeforeDiscounts)s per %(billingTermInYears)s years',
							{ args }
					  )
					: translate(
							'%(formattedCurrentPrice)s first year then %(formattedPriceBeforeDiscounts)s per %(billingTermInYears)s years',
							{ args }
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
				return translate(
					'%(formattedCurrentPrice)s first %(introCount)s months then %(formattedPriceBeforeDiscounts)s per %(billingTermInYears)s years',
					{ args }
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

	return (
		<Variant>
			<Label>
				{ variant.variantLabel }
				{ discountPercentage > 0 && isMobile && (
					<DiscountPercentage percent={ discountPercentage } />
				) }
			</Label>
			<span>
				{ discountPercentage > 0 && ! isMobile && ! isIntroductoryOffer && (
					<DiscountPercentage percent={ discountPercentage } />
				) }
				{ discountPercentage > 0 && ! isIntroductoryOffer && (
					<DoNotPayThis>{ formattedCompareToPriceForVariantTerm }</DoNotPayThis>
				) }
				<Price aria-hidden={ isIntroductoryOffer }>{ formattedCurrentPrice }</Price>
				<IntroPricing>
					<IntroPricingText>
						{ isIntroductoryOffer && translatedIntroOfferDetails() }
					</IntroPricingText>
				</IntroPricing>
			</span>
		</Variant>
	);
};
