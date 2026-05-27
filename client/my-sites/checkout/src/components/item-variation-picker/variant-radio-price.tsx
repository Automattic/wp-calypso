import colorStudio from '@automattic/color-studio';
import { formatCurrency } from '@automattic/number-formatters';
import {
	calculateDiscountPercentage,
	fromVariantPriceData,
	getPlanPriceForDuration,
} from '@automattic/plans-grid-next';
import { styled } from '@automattic/wpcom-checkout';
import i18n, { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
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
	padding-right: 6px;
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
	align-items: flex-start;
	gap: 2px;
`;

const PriceArea = styled.span< { inlineDiscount?: boolean } >`
	text-align: right;
	display: flex;
	flex-direction: ${ ( props ) => ( props.inlineDiscount ? 'row' : 'column' ) };
	gap: ${ ( props ) => ( props.inlineDiscount ? '8px' : '2px' ) };
	align-items: ${ ( props ) => ( props.inlineDiscount ? 'center' : 'flex-end' ) };
	> span:last-child {
		min-width: 80px;
		text-align: right;
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

export const ItemVariantRadioPrice: FunctionComponent< {
	variant: WPCOMProductVariant;
	compareTo?: WPCOMProductVariant;
} > = ( { variant, compareTo } ) => {
	const translate = useTranslate();
	const compareToInfo = compareTo ? fromVariantPriceData( compareTo ) : null;
	const variantInfo = fromVariantPriceData( variant );
	const discountPercentage = compareToInfo
		? calculateDiscountPercentage(
				getPlanPriceForDuration( compareToInfo, variantInfo.termMonths ),
				getPlanPriceForDuration( variantInfo, variantInfo.termMonths )
		  ) ?? 0
		: 0;

	// Calculate months per bill period with introductory offers.
	let priceTermIntervalInMonths = variant.termIntervalInMonths;
	if ( variant.introductoryTerm === 'month' ) {
		priceTermIntervalInMonths = variant.introductoryInterval ?? 1;
	}

	const pricePerMonth = Math.round( variant.priceInteger / priceTermIntervalInMonths );

	const pricePerMonthFormatted = formatCurrency( pricePerMonth, variant.currency, {
		stripZeros: true,
		isSmallestUnit: true,
	} );

	const priceDisplay = i18n.fixMe( {
		text: '%(pricePerMonth)s/mo',
		newCopy: translate( '%(pricePerMonth)s/mo', {
			args: {
				pricePerMonth: pricePerMonthFormatted,
			},
		} ),
		oldCopy: translate( '%(pricePerMonth)s /mo', {
			args: {
				pricePerMonth: pricePerMonthFormatted,
			},
		} ),
	} );
	const label =
		variant.termIntervalInMonths === 1 ? translate( 'Month' ) : variant.variantLabel.noun;
	return (
		<Variant>
			<VariantTermLabel>{ label }</VariantTermLabel>
			<PriceArea inlineDiscount={ discountPercentage > 0 }>
				{ discountPercentage > 0 && <DiscountPercentage percent={ discountPercentage } /> }
				<Price>{ priceDisplay }</Price>
			</PriceArea>
		</Variant>
	);
};
