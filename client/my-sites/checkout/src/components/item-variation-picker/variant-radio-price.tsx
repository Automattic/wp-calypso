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
import { useMobileCheckoutStickySummaryExperiment } from 'calypso/my-sites/checkout/src/hooks/use-mobile-checkout-sticky-summary-experiment';
import useCartKey from '../../../use-cart-key';
import type { WPCOMProductVariant } from './types';

const Discount = styled.span< { isMobileCheckoutStickySummary?: boolean } >`
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

	${ ( props ) =>
		props.isMobileCheckoutStickySummary &&
		`
		color: ${ colorStudio.colors[ 'Green 80' ] };
		background-color: rgba( 184, 230, 191, 0.68 );
		border: 1px solid rgba( 0, 0, 0, 0.08 );
		border-radius: 2px;
		padding: 0 8px;
		font-size: 11px;
		font-weight: 500;
		letter-spacing: -0.08px;
	` }
`;

const Price = styled.span< {
	isCheckoutUiRedesignV1?: boolean;
	isMobileCheckoutStickySummary?: boolean;
} >`
	color: ${ colorStudio.colors[ 'Black' ] };
	${ ( props ) => props.isCheckoutUiRedesignV1 && 'padding-right: 6px;' }
	${ ( props ) =>
		props.isMobileCheckoutStickySummary &&
		`
		color: var( --studio-gray-100 );
		font-size: 13px;
		font-weight: 500;
		line-height: 20px;
	` }
`;

const PriceSuffix = styled.span`
	font-weight: 400;
`;

const Variant = styled.div< { isMobileCheckoutStickySummary?: boolean } >`
	align-items: center;
	display: flex;
	font-size: 16px;
	font-weight: 400;
	justify-content: space-between;
	line-height: 24px;
	width: 100%;

	${ ( props ) =>
		props.isMobileCheckoutStickySummary &&
		`
		color: var( --studio-gray-100 );
		font-size: 13px;
		line-height: 20px;
	` }
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

const DiscountPercentage: FunctionComponent< {
	percent: number;
	isMobileCheckoutStickySummary?: boolean;
} > = ( { percent, isMobileCheckoutStickySummary } ) => {
	const translate = useTranslate();
	return (
		<Discount isMobileCheckoutStickySummary={ isMobileCheckoutStickySummary }>
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
	const { isMobileCheckoutStickySummary } = useMobileCheckoutStickySummaryExperiment();
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
		if ( isMobileCheckoutStickySummary ) {
			// Render the suffix in its own span so the medium weight on
			// <Price> doesn't bleed into "/mo" (Figma 2392:15326 wants
			// regular).
			return (
				<>
					{ pricePerMonthFormatted }
					<PriceSuffix>{ translate( '/mo' ) }</PriceSuffix>
				</>
			);
		}
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
	const showInlineDiscount =
		( isCheckoutUiRedesignV1 || isMobileCheckoutStickySummary ) && discountPercentage > 0;
	return (
		<Variant isMobileCheckoutStickySummary={ isMobileCheckoutStickySummary }>
			<VariantTermLabel isCheckoutUiRedesignV1={ isCheckoutUiRedesignV1 }>
				{ label }
			</VariantTermLabel>
			<PriceArea
				inlineDiscount={ showInlineDiscount }
				isCheckoutUiRedesignV1={ isCheckoutUiRedesignV1 }
			>
				{ isApplyingCoupon ? (
					<LoadingCopy width="70px" height="16px" noMargin />
				) : (
					<>
						{ showInlineDiscount && (
							<DiscountPercentage
								percent={ discountPercentage }
								isMobileCheckoutStickySummary={ isMobileCheckoutStickySummary }
							/>
						) }
						<Price
							isCheckoutUiRedesignV1={ isCheckoutUiRedesignV1 }
							isMobileCheckoutStickySummary={ isMobileCheckoutStickySummary }
						>
							{ priceDisplay }
						</Price>
						{ ! isCheckoutUiRedesignV1 &&
							! isMobileCheckoutStickySummary &&
							discountPercentage > 0 && <DiscountPercentage percent={ discountPercentage } /> }
					</>
				) }
			</PriceArea>
		</Variant>
	);
};
