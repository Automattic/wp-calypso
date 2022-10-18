import formatCurrency from '@automattic/format-currency';
import { styled } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import type { WPCOMProductVariant } from './types';

const Discount = styled.span`
	color: ${ ( props ) => props.theme.colors.discount };

	.item-variant-option--selected & {
		color: #b8e6bf;
	}

	@media ( max-width: 660px ) {
		width: 100%;
	}
`;

const DoNotPayThis = styled.del`
	text-decoration: line-through;
	color: #646970;

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

const Variant = styled.span`
	display: flex;
	justify-content: flex-end;
	flex-wrap: wrap;
	column-gap: 0.5rem;
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

export const ItemVariantPrice: FunctionComponent< {
	variant: WPCOMProductVariant;
	compareTo?: WPCOMProductVariant;
} > = ( { variant, compareTo } ) => {
	// This is the price that the compareTo variant would be if it was using the
	// billing term of the variant. For example, if the price of the compareTo
	// variant was 120 per year, and the variant we are displaying here is 5 per
	// month, then `compareToPriceForVariantTerm` would be (120 / 12) * 1,
	// or 10 (per month). In this case, selecting the variant would save the user
	// 50% (5 / 10).
	const compareToPriceForVariantTerm = compareTo
		? compareTo.pricePerMonth * variant.termIntervalInMonths
		: undefined;
	// Extremely low "discounts" are possible if the price of the longer term has been rounded
	// if they cannot be rounded to at least a percentage point we should not show them.
	const discountPercentage = compareToPriceForVariantTerm
		? Math.floor( 100 - ( variant.price / compareToPriceForVariantTerm ) * 100 )
		: 0;
	const formattedCurrentPrice = formatCurrency( variant.price, variant.currency, {
		stripZeros: true,
	} );
	const formattedCompareToPriceForVariantTerm = compareToPriceForVariantTerm
		? formatCurrency( compareToPriceForVariantTerm, variant.currency, { stripZeros: true } )
		: undefined;

	return (
		<Variant>
			{ discountPercentage > 0 && <DiscountPercentage percent={ discountPercentage } /> }
			{ discountPercentage > 0 && (
				<DoNotPayThis>{ formattedCompareToPriceForVariantTerm }</DoNotPayThis>
			) }
			<Price>{ formattedCurrentPrice }</Price>
		</Variant>
	);
};
