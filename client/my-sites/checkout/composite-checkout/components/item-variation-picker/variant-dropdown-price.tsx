import { isJetpackProduct } from '@automattic/calypso-products';
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
	// Jetpack introductory pricing displays the introductory price for the first term, then the regular price for the remaining term.
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
	const isJetpackIntroductoryOffer = isJetpackProduct( variant ) && introCount > 0;
	const translate = useTranslate();
	// the backend returns the term in text, but it it adds "one" like One year, which looks off so we're creating our own.
	const planTerm = () => {
		let termToTranslate = translate( 'month' );
		if ( productBillingTermInMonths > 12 ) {
			//biannual is currently the only possible term past 1 year
			termToTranslate = translate( '2 years' );
		} else if ( productBillingTermInMonths > 1 ) {
			termToTranslate = translate( 'year' );
		}
		return termToTranslate;
	};
	const translatedIntroOfferPrice = translate(
		'%(formattedCurrentPrice)s first %(introTerm)s then %(formattedPriceBeforeDiscounts)s per %(planTerm)s',
		// translation example: $4.99 first month then $9.99 per year
		{
			args: {
				formattedCurrentPrice,
				formattedPriceBeforeDiscounts,
				introTerm,
				planTerm: planTerm(),
			},
		}
	);

	const translatedIntroOfferPriceMobile = translate(
		'%(formattedCurrentPrice)s first %(introTerm)s',
		// translation example: $4.99 first month
		{
			args: {
				formattedCurrentPrice,
				introTerm,
			},
		}
	);

	return (
		<Variant>
			<Label>
				{ variant.variantLabel }
				{ discountPercentage > 0 && isMobile && (
					<DiscountPercentage percent={ discountPercentage } />
				) }
			</Label>
			<span>
				{ discountPercentage > 0 && ! isMobile && ! isJetpackIntroductoryOffer && (
					<DiscountPercentage percent={ discountPercentage } />
				) }
				{ discountPercentage > 0 && ! isJetpackIntroductoryOffer && (
					<DoNotPayThis>{ formattedCompareToPriceForVariantTerm }</DoNotPayThis>
				) }
				<Price aria-hidden={ isJetpackIntroductoryOffer }>{ formattedCurrentPrice }</Price>
				<IntroPricing>
					{ isJetpackIntroductoryOffer && ! isMobile && translatedIntroOfferPrice }
					{ isJetpackIntroductoryOffer && isMobile && translatedIntroOfferPriceMobile }
				</IntroPricing>
			</span>
		</Variant>
	);
};
