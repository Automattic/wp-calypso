import { PlanPrice } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { TranslateResult } from 'i18n-calypso';
import { isNumber } from 'lodash';
import InfoPopover from 'calypso/components/info-popover';
import PriceAriaLabel from './price-aria-label';
import TimeFrame from './time-frame';
import type { Duration } from 'calypso/my-sites/plans/jetpack-plans/types';
import type { Moment } from 'moment';
import type { ReactNode } from 'react';

type OwnProps = {
	discountedPrice?: number;
	discountedPriceDuration?: number;
	discountedPriceFirst?: boolean;
	originalPrice?: number;
	pricesAreFetching?: boolean | null;
	billingTerm: Duration;
	currencyCode?: string | null;
	displayFrom?: boolean;
	tooltipText?: TranslateResult | ReactNode;
	expiryDate?: Moment;
	displayPriceText?: TranslateResult | null;
	customTimeFrameSavings?: ReactNode;
	customTimeFrameBillingTerms?: ReactNode;
};

const Placeholder: React.FC< OwnProps > = ( { billingTerm, expiryDate, discountedPrice } ) => {
	return (
		<>
			<PlanPrice
				original
				className="display-price__original-price"
				rawPrice={ 0.01 }
				currencyCode="USD"
			/>
			{ isNumber( discountedPrice ) && (
				<PlanPrice discounted rawPrice={ 0.01 } currencyCode="USD" />
			) }
			<TimeFrame expiryDate={ expiryDate } billingTerm={ billingTerm } />
		</>
	);
};

const DiscountedPrice: React.FC< OwnProps & { finalPrice: number } > = ( {
	discountedPriceFirst,
	originalPrice,
	currencyCode,
	finalPrice,
} ) => {
	const theDiscountedPrice = (
		<PlanPrice
			discounted
			rawPrice={ finalPrice as number }
			currencyCode={ currencyCode }
			omitHeading
		/>
	);
	/*
	 * Price should be displayed from left-to-right, even in right-to-left
	 * languages. `PlanPrice` seems to keep the ltr direction no matter
	 * what when seen in the dev docs page, but somehow it doesn't in
	 * the pricing page.
	 */
	return (
		<>
			{ discountedPriceFirst && theDiscountedPrice }
			<PlanPrice
				original
				className="display-price__original-price"
				rawPrice={ originalPrice as number }
				currencyCode={ currencyCode }
				omitHeading
			/>
			{ ! discountedPriceFirst && theDiscountedPrice }
		</>
	);
};

const OriginalPrice: React.FC< OwnProps & { finalPrice: number } > = ( {
	currencyCode,
	finalPrice,
} ) => {
	return (
		<PlanPrice
			discounted
			rawPrice={ finalPrice as number }
			currencyCode={ currencyCode }
			omitHeading
		/>
	);
};

const Paid: React.FC< OwnProps > = ( props ) => {
	const {
		discountedPrice,
		discountedPriceDuration,
		originalPrice,
		pricesAreFetching,
		billingTerm,
		currencyCode,
		displayFrom,
		tooltipText,
		displayPriceText,
		customTimeFrameSavings,
		customTimeFrameBillingTerms,
	} = props;
	const finalPrice = ( isNumber( discountedPrice ) ? discountedPrice : originalPrice ) as number;
	const isDiscounted = !! ( isNumber( finalPrice ) && originalPrice && finalPrice < originalPrice );
	const discountPercentage = isDiscounted
		? Math.floor( ( ( originalPrice - finalPrice ) / originalPrice ) * 100 )
		: 0;

	// Placeholder (while prices are loading)
	if ( ! currencyCode || ! originalPrice || pricesAreFetching ) {
		return <Placeholder { ...props } />;
	}

	const formattedOriginalPrice = formatCurrency( originalPrice, currencyCode, {
		stripZeros: true,
	} );

	let priceComponent = isDiscounted ? (
		<DiscountedPrice { ...props } finalPrice={ finalPrice } />
	) : (
		<OriginalPrice { ...props } finalPrice={ finalPrice } />
	);

	// If the price is varied, we'll show the cost with a preset string.
	if ( displayPriceText ) {
		priceComponent = (
			<span className="display-price__varied-card-price">
				<PlanPrice productDisplayPrice={ displayPriceText } />
			</span>
		);
	}

	// If the pricing has a limited discount duration, the original price is handled in the duration string
	// In this case, we'll just show the final price and not the crossed-out price.
	if ( discountedPriceDuration ) {
		priceComponent = (
			<span className="display-price__standalone-card-price">
				<PlanPrice rawPrice={ finalPrice } currencyCode={ currencyCode } />
			</span>
		);
	}

	return (
		<>
			<PriceAriaLabel
				{ ...props }
				discountPercentage={ discountPercentage }
				currencyCode={ currencyCode }
				finalPrice={ finalPrice }
				isDiscounted={ isDiscounted }
				formattedOriginalPrice={ formattedOriginalPrice }
			/>
			<span className="display-price__prices" aria-hidden="true">
				{ displayFrom && <span className="display-price__from">from</span> }
				{ priceComponent }
				{ tooltipText && (
					<InfoPopover position="top" className="display-price__price-tooltip">
						{ tooltipText }
					</InfoPopover>
				) }
			</span>
			{ ! displayPriceText && (
				<>
					<span className="display-price__details" aria-hidden="true">
						{ ! customTimeFrameBillingTerms && (
							<TimeFrame
								billingTerm={ billingTerm }
								discountedPriceDuration={ discountedPriceDuration }
								discountPercentage={ discountPercentage }
								formattedOriginalPrice={ formattedOriginalPrice }
								isDiscounted={ isDiscounted }
								finalPrice={ finalPrice }
							/>
						) }
						{ customTimeFrameSavings && customTimeFrameSavings }
					</span>
					{ customTimeFrameBillingTerms && customTimeFrameBillingTerms }
				</>
			) }
		</>
	);
};

export default Paid;
