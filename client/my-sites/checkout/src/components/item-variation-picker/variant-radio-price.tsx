import colorStudio from '@automattic/color-studio';
import { formatCurrency } from '@automattic/number-formatters';
import { styled } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { getItemVariantDiscountPercentage } from './util';
import type { WPCOMProductVariant } from './types';

const Discount = styled.span`
	text-align: center;
	color: ${ colorStudio.colors[ 'Green 80' ] };

	display: block;
	background-color: ${ colorStudio.colors[ 'Green 5' ] };
	padding: 0 10px;
	border-radius: 4px;
	font-size: 12px;
	line-height: 20px;

	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}
`;

const Price = styled.span`
	color: ${ colorStudio.colors[ 'Black' ] };
`;

const Variant = styled.div`
	align-items: center;
	display: flex;
	font-size: 16px;
	font-weight: 400;
	justify-content: space-between;
	line-height: 24px;
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
	align-items: flex-end;
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

export const ItemVariantRadioPrice: FunctionComponent< {
	variant: WPCOMProductVariant;
	compareTo?: WPCOMProductVariant;
} > = ( { variant, compareTo } ) => {
	const translate = useTranslate();
	const discountPercentage = getItemVariantDiscountPercentage( variant, compareTo );

	const pricePerMonth = Math.round( variant.priceInteger / variant.termIntervalInMonths );

	const pricePerMonthFormatted = formatCurrency( pricePerMonth, variant.currency, {
		stripZeros: true,
		isSmallestUnit: true,
	} );

	const priceDisplay = ( () => {
		return translate( '%(pricePerMonth)s /mo', {
			args: {
				pricePerMonth: pricePerMonthFormatted,
			},
		} );
	} )();
	const label =
		variant.termIntervalInMonths === 1 ? translate( 'Month' ) : variant.variantLabel.noun;
	return (
		<Variant>
			<VariantTermLabel>{ label }</VariantTermLabel>
			<PriceArea>
				<Price>{ priceDisplay }</Price>
				{ discountPercentage > 0 && <DiscountPercentage percent={ discountPercentage } /> }
			</PriceArea>
		</Variant>
	);
};
