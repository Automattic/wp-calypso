import formatCurrency from '@automattic/format-currency';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { hasCheckoutVersion } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { useCheckoutV2 } from '../../hooks/use-checkout-v2';
import { Discount, Label, Price, PriceTextContainer, Variant } from './styles';
import type { WPCOMProductVariant } from './types';
import type { FunctionComponent } from 'react';

const isFirstMonthTrial = ( variant: WPCOMProductVariant ) =>
	variant.termIntervalInMonths === 12 &&
	variant.introductoryTerm === 'month' &&
	variant.introductoryInterval === 1;

const JetpackDiscountDisplay: FunctionComponent< {
	finalPriceInteger: number;
	isFirstMonthTrial?: boolean;
	showIntroOffer?: boolean;
	discountInteger: number;
	currency: string;
} > = ( { finalPriceInteger, isFirstMonthTrial, showIntroOffer, discountInteger, currency } ) => {
	const translate = useTranslate();
	const shouldUseCheckoutV2 = useCheckoutV2() === 'treatment';
	if ( isFirstMonthTrial && 0 === finalPriceInteger ) {
		return (
			<Discount shouldUseCheckoutV2={ shouldUseCheckoutV2 }>
				{ translate( 'One month free trial' ) }
			</Discount>
		);
	}

	return (
		<Discount shouldUseCheckoutV2={ shouldUseCheckoutV2 }>
			{ showIntroOffer && translate( 'Introductory offer: ' ) }
			{ translate( 'Save %(price)s', {
				args: {
					price: formatCurrency( discountInteger, currency, {
						stripZeros: true,
						isSmallestUnit: true,
					} ),
				},
			} ) }
		</Discount>
	);
};

export const JetpackItemVariantDropDownPrice: FunctionComponent< {
	variant: WPCOMProductVariant;
	allVariants: WPCOMProductVariant[];
} > = ( { variant, allVariants } ) => {
	const isMobile = useMobileBreakpoint();
	const shouldUseCheckoutV2 = useCheckoutV2() === 'treatment';

	// We offer a free month trial for selected yearly plans (for now, only Social Advanced)

	const calculateDiscount = () => {
		const oneYearVariant = allVariants.find( ( v ) => 12 === v.termIntervalInMonths );
		if ( 24 === variant.termIntervalInMonths && oneYearVariant ) {
			return oneYearVariant.priceBeforeDiscounts * 2 - variant.priceInteger;
		}
		// For all plans except 2 years, the savings is the difference between the price before discounts and the price integer
		return variant.priceBeforeDiscounts - variant.priceInteger;
	};

	const discountInteger = calculateDiscount();
	const showIntroOffer = variant.introductoryInterval > 0 && variant.termIntervalInMonths === 12;

	return (
		<Variant shouldUseCheckoutV2={ shouldUseCheckoutV2 }>
			<Label shouldUseCheckoutV2={ shouldUseCheckoutV2 }>
				{ variant.variantLabel }
				{ isMobile && discountInteger > 0 && (
					<JetpackDiscountDisplay
						finalPriceInteger={ variant.priceInteger }
						discountInteger={ discountInteger }
						currency={ variant.currency }
					/>
				) }
			</Label>
			<PriceTextContainer shouldUseCheckoutV2={ shouldUseCheckoutV2 }>
				{ ! isMobile && discountInteger > 0 && (
					<JetpackDiscountDisplay
						finalPriceInteger={ variant.priceInteger }
						discountInteger={ discountInteger }
						currency={ variant.currency }
						showIntroOffer={ showIntroOffer }
						isFirstMonthTrial={ isFirstMonthTrial( variant ) }
					/>
				) }
				{ ! ( hasCheckoutVersion( '2' ) || shouldUseCheckoutV2 ) && (
					<Price aria-hidden={ variant.introductoryInterval > 0 }>
						{ formatCurrency( variant.priceInteger, variant.currency, {
							stripZeros: true,
							isSmallestUnit: true,
						} ) }
					</Price>
				) }
			</PriceTextContainer>
		</Variant>
	);
};
