import formatCurrency from '@automattic/format-currency';
import { styled } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { getItemVariantDiscountPercentage } from './util';
import type { WPCOMProductVariant } from './types';

const Discount = styled.span`
	text-align: center;
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

const VariantTermLabel = styled.span`
	display: flex;
	flex-direction: column;
	gap: 2px;
`;

const PriceArea = styled.span`
	text-align: right;
	display: flex;
	flex-direction: column;
	gap: 2px;
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

const VariantBillingTotal = styled.div`
	font-size: small;
	color: #777;
`;

export const ItemVariantRadioPrice: FunctionComponent< {
	variant: WPCOMProductVariant;
	compareTo?: WPCOMProductVariant;
} > = ( { variant, compareTo } ) => {
	const translate = useTranslate();
	const discountPercentage = getItemVariantDiscountPercentage( variant, compareTo );
	const formattedCurrentPrice = formatCurrency( variant.priceInteger, variant.currency, {
		stripZeros: true,
		isSmallestUnit: true,
	} );

	const pricePerMonth = Math.round( variant.priceInteger / variant.termIntervalInMonths );
	const pricePerYear = pricePerMonth * 12;

	const pricePerYearFormatted = formatCurrency( pricePerYear, variant.currency, {
		stripZeros: true,
		isSmallestUnit: true,
	} );
	const pricePerMonthFormatted = formatCurrency( pricePerMonth, variant.currency, {
		stripZeros: true,
		isSmallestUnit: true,
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

	const shouldShowBillingTotal = variant.termIntervalInMonths !== compareTo?.termIntervalInMonths;
	const billingTotal = translate( 'Billed as one payment of %(totalPrice)s', {
		args: {
			totalPrice: formattedCurrentPrice,
		},
	} );

	return (
		<Variant>
			<VariantTermLabel>
				{ variant.variantLabel }
				{ shouldShowBillingTotal && <VariantBillingTotal>{ billingTotal }</VariantBillingTotal> }
			</VariantTermLabel>
			<PriceArea>
				<Price>{ priceDisplay }</Price>
				{ discountPercentage > 0 && <DiscountPercentage percent={ discountPercentage } /> }
			</PriceArea>
		</Variant>
	);
};
