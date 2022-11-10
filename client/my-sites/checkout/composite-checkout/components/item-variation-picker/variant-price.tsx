import formatCurrency from '@automattic/format-currency';
import { styled } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import type { WPCOMProductVariant } from './types';

const Discount = styled.span`
	color: #234929;
	display: block;
	background-color: #b8e6bf;
	padding: 0 1em;
	border-radius: 4px;

	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}
`;

const Price = styled.span`
	color: #000;
`;

const Variant = styled.div`
	align-items: center;
	display: flex;
	font-size: 14px;
	font-weight: 400;
	justify-content: space-between;
	line-height: 20px;
	width: 100%;
`;

const Label = styled.span`
	display: flex;
	flex-direction: column;
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

export function getItemVariantCompareToPrice(
	variant: WPCOMProductVariant,
	compareTo?: WPCOMProductVariant
): number | undefined {
	// This is the price that the compareTo variant would be if it was using the
	// billing term of the variant. For example, if the price of the compareTo
	// variant was 120 per year, and the variant we are displaying here is 5 per
	// month, then `compareToPriceForVariantTerm` would be (120 / 12) * 1,
	// or 10 (per month). In this case, selecting the variant would save the user
	// 50% (5 / 10).
	const compareToPriceForVariantTerm = compareTo
		? compareTo.pricePerMonth * variant.termIntervalInMonths
		: undefined;
	return compareToPriceForVariantTerm;
}

export function getItemVariantDiscountPercentage(
	variant: WPCOMProductVariant,
	compareTo?: WPCOMProductVariant
): number {
	const compareToPriceForVariantTerm = getItemVariantCompareToPrice( variant, compareTo );
	// Extremely low "discounts" are possible if the price of the longer term has been rounded
	// if they cannot be rounded to at least a percentage point we should not show them.
	const discountPercentage = compareToPriceForVariantTerm
		? Math.floor( 100 - ( variant.price / compareToPriceForVariantTerm ) * 100 )
		: 0;
	return discountPercentage;
}

const PriceArea = styled.span`
	text-align: right;
`;

const PricePerTermText = styled.div`
	font-size: small;
	color: #777;
`;

export const ItemVariantPrice: FunctionComponent< {
	variant: WPCOMProductVariant;
	compareTo?: WPCOMProductVariant;
} > = ( { variant, compareTo } ) => {
	const translate = useTranslate();
	const discountPercentage = getItemVariantDiscountPercentage( variant, compareTo );
	const formattedCurrentPrice = formatCurrency( variant.price, variant.currency, {
		stripZeros: true,
	} );

	const pricePerYear = variant.pricePerYear;
	const pricePerYearFormatted = formatCurrency( pricePerYear, variant.currency, {
		stripZeros: true,
	} );
	const perYearText = translate( '%(pricePerYear)s / year x 2', {
		args: {
			pricePerYear: pricePerYearFormatted,
		},
	} );

	return (
		<Variant>
			<Label>
				{ variant.variantLabel }
				{ variant.termIntervalInMonths === 24 && (
					<PricePerTermText>{ perYearText }</PricePerTermText>
				) }
			</Label>
			<PriceArea>
				<Price>{ formattedCurrentPrice }</Price>
				{ discountPercentage > 0 && <DiscountPercentage percent={ discountPercentage } /> }
			</PriceArea>
		</Variant>
	);
};
