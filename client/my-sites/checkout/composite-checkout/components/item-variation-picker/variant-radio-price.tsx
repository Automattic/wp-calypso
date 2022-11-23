import formatCurrency from '@automattic/format-currency';
import { styled } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { getItemVariantDiscountPercentage } from './util';
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

const PriceArea = styled.span`
	text-align: right;
`;

const SubText = styled.div`
	font-size: small;
	color: #777;
`;

export const ItemVariantRadioPrice: FunctionComponent< {
	variant: WPCOMProductVariant;
	compareTo?: WPCOMProductVariant;
} > = ( { variant, compareTo } ) => {
	const translate = useTranslate();
	const discountPercentage = getItemVariantDiscountPercentage( variant, compareTo );
	const formattedCurrentPrice = formatCurrency( variant.price, variant.currency, {
		stripZeros: true,
	} );

	const pricePerYearFormatted = formatCurrency( variant.pricePerYear, variant.currency, {
		stripZeros: true,
	} );
	const pricePerMonthFormatted = formatCurrency( variant.pricePerMonth, variant.currency, {
		stripZeros: true,
	} );
	const subText = translate( 'Billed as one payment of %(totalPrice)s', {
		args: {
			totalPrice: formattedCurrentPrice,
		},
	} );

	const shouldShowMonthlyPrice =
		compareTo?.termIntervalInMonths === 1 || variant.termIntervalInMonths === 1;
	const priceDisplay = ( () => {
		if ( shouldShowMonthlyPrice ) {
			return translate( '%(pricePerMonth)s / month', {
				args: {
					pricePerMonth: pricePerMonthFormatted,
				},
			} );
		}
		return translate( '%(pricePerYear)s / year', {
			args: {
				pricePerYear: pricePerYearFormatted,
			},
		} );
	} )();

	return (
		<Variant>
			<Label>
				{ variant.variantLabel }
				{ variant.termIntervalInMonths === 24 && <SubText>{ subText }</SubText> }
			</Label>
			<PriceArea>
				<Price>{ priceDisplay }</Price>
				{ discountPercentage > 0 && <DiscountPercentage percent={ discountPercentage } /> }
			</PriceArea>
		</Variant>
	);
};
