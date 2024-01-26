import formatCurrency from '@automattic/format-currency';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { hasCheckoutVersion } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { Discount, Label, Price, PriceTextContainer, Variant } from './styles';
import type { WPCOMProductVariant } from './types';
import type { FunctionComponent } from 'react';

const isFreeMonthTrial = ( variant: WPCOMProductVariant ) =>
	variant.termIntervalInMonths === 12 &&
	variant.introductoryTerm === 'month' &&
	variant.introductoryInterval === 1;

const JetpackDiscountDisplay: FunctionComponent< {
	isFreeMonthTrial?: boolean;
	showIntroOffer?: boolean;
	priceInteger: number;
	currency: string;
} > = ( { isFreeMonthTrial, showIntroOffer, priceInteger, currency } ) => {
	const translate = useTranslate();

	if ( isFreeMonthTrial ) {
		return <Discount>{ translate( 'One month free trial' ) }</Discount>;
	}

	return (
		<Discount>
			{ showIntroOffer && translate( 'Introductory offer: ' ) }
			{ translate( 'Save %(price)s', {
				args: {
					price: formatCurrency( priceInteger, currency, {
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

	// We offer a free month trial for selected yearly plans (for now, only Social Advanced)

	const calculateSavings = () => {
		const oneYearVariant = allVariants.find( ( v ) => 12 === v.termIntervalInMonths );
		if ( 24 === variant.termIntervalInMonths && oneYearVariant ) {
			return oneYearVariant.priceBeforeDiscounts * 2 - variant.priceInteger;
		}

		// For all plans except 2 years, the savings is the difference between the price before discounts and the price integer
		return variant.priceBeforeDiscounts - variant.priceInteger;
	};

	const savingsInteger = calculateSavings();
	const showIntroOffer = variant.introductoryInterval > 0 && variant.termIntervalInMonths === 12;

	return (
		<Variant>
			<Label>
				{ variant.variantLabel }
				{ isMobile && savingsInteger > 0 && (
					<JetpackDiscountDisplay priceInteger={ savingsInteger } currency={ variant.currency } />
				) }
			</Label>
			<PriceTextContainer>
				{ ! isMobile && savingsInteger > 0 && (
					<JetpackDiscountDisplay
						priceInteger={ savingsInteger }
						currency={ variant.currency }
						showIntroOffer={ showIntroOffer }
						isFreeMonthTrial={ isFreeMonthTrial( variant ) }
					/>
				) }
				{ ! hasCheckoutVersion( '2' ) && (
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
