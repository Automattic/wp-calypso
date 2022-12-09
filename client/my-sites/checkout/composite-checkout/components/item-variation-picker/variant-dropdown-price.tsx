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
	const planTerm = variant.termIntervalInDays > 31 ? 'year' : 'month';
	const introTerm = variant.introIntervalUnit;
	const introCount = variant.introIntervalCount;
	const isMobile = useMobileBreakpoint();
	const isJetpackIntroductoryOffer = isJetpackProduct( variant ) && introCount > 0;
	const formattedRegularPrice = formatCurrency( variant.regularPrice, variant.currency );
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
	const translate = useTranslate();
	const translatedIntroOfferPrice = translate(
		' for the first %(introTerm)s then %(formattedRegularPrice)s per %(planTerm)s',
		{
			args: {
				formattedRegularPrice,
				planTerm,
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
				<Price>
					{ formattedCurrentPrice }
					{ isJetpackIntroductoryOffer && translatedIntroOfferPrice }
				</Price>
			</span>
		</Variant>
	);
};
