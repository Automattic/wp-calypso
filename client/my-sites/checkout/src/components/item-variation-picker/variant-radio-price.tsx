import colorStudio from '@automattic/color-studio';
import { formatCurrency } from '@automattic/number-formatters';
import {
	calculateDiscountPercentage,
	fromVariantPriceData,
	getPlanPriceForDuration,
} from '@automattic/plans-grid-next';
import { useShoppingCart } from '@automattic/shopping-cart';
import { LoadingCopy, styled } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useCheckoutUiRedesignExperiment } from 'calypso/my-sites/checkout/src/hooks/use-checkout-ui-redesign-experiment';
import useCartKey from '../../../use-cart-key';
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

const Price = styled.span< { isCheckoutUiRedesignV1?: boolean } >`
	color: ${ colorStudio.colors[ 'Black' ] };
	${ ( props ) => props.isCheckoutUiRedesignV1 && 'padding-right: 6px;' }
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

const VariantTermLabel = styled.span< { isCheckoutUiRedesignV1?: boolean } >`
	display: flex;
	flex-direction: column;
	${ ( props ) => props.isCheckoutUiRedesignV1 && 'align-items: flex-start;' }
	gap: 2px;
`;

const PriceArea = styled.span< { inlineDiscount?: boolean; isCheckoutUiRedesignV1?: boolean } >`
	text-align: right;
	display: flex;
	flex-direction: ${ ( props ) => ( props.inlineDiscount ? 'row' : 'column' ) };
	gap: ${ ( props ) => ( props.inlineDiscount ? '8px' : '2px' ) };
	align-items: ${ ( props ) => ( props.inlineDiscount ? 'center' : 'flex-end' ) };
	${ ( props ) =>
		props.isCheckoutUiRedesignV1 &&
		`
		> span:last-child {
			min-width: 80px;
			text-align: right;
		}
	` }
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
	const cartKey = useCartKey();
	const { couponStatus } = useShoppingCart( cartKey );
	const isApplyingCoupon = couponStatus === 'pending';
	const [ , isCheckoutUiRedesignV1 ] = useCheckoutUiRedesignExperiment();
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

	const priceDisplay = ( () => {
		if ( isCheckoutUiRedesignV1 ) {
			return translate( '%(pricePerMonth)s/mo', {
				args: {
					pricePerMonth: pricePerMonthFormatted,
				},
			} );
		}
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
			<VariantTermLabel isCheckoutUiRedesignV1={ isCheckoutUiRedesignV1 }>
				{ label }
			</VariantTermLabel>
			<PriceArea
				inlineDiscount={ isCheckoutUiRedesignV1 && discountPercentage > 0 }
				isCheckoutUiRedesignV1={ isCheckoutUiRedesignV1 }
			>
				{ isApplyingCoupon ? (
					<LoadingCopy width="70px" height="16px" noMargin />
				) : (
					<>
						{ isCheckoutUiRedesignV1 && discountPercentage > 0 && (
							<DiscountPercentage percent={ discountPercentage } />
						) }
						<Price isCheckoutUiRedesignV1={ isCheckoutUiRedesignV1 }>{ priceDisplay }</Price>
						{ ! isCheckoutUiRedesignV1 && discountPercentage > 0 && (
							<DiscountPercentage percent={ discountPercentage } />
						) }
					</>
				) }
			</PriceArea>
		</Variant>
	);
};
