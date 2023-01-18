import { TranslateResult } from 'i18n-calypso';
import InfoPopover from 'calypso/components/info-popover';
import PlanPrice from 'calypso/my-sites/plan-price';
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
};

const Placeholder: React.FC< OwnProps > = ( { billingTerm, expiryDate } ) => {
	return (
		<>
			<PlanPrice
				original
				className="display-price__original-price"
				rawPrice={ 0.01 }
				currencyCode="USD"
			/>
			{ /* Remove this secondary <PlanPrice/> placeholder if we're not showing discounted prices */ }
			<PlanPrice discounted rawPrice={ 0.01 } currencyCode="USD" />
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
	} = props;
	const finalPrice = ( discountedPrice ?? originalPrice ) as number;
	const isDiscounted = !! ( finalPrice && originalPrice && finalPrice < originalPrice );

	// Placeholder (while prices are loading)
	if ( ! currencyCode || ! originalPrice || pricesAreFetching ) {
		return <Placeholder { ...props } />;
	}

	return (
		<>
			<PriceAriaLabel
				{ ...props }
				currencyCode={ currencyCode }
				finalPrice={ finalPrice }
				isDiscounted={ isDiscounted }
			/>
			<span className="display-price__prices" aria-hidden="true">
				{ displayFrom && <span className="display-price__from">from</span> }
				{ isDiscounted ? (
					<DiscountedPrice { ...props } finalPrice={ finalPrice } />
				) : (
					<OriginalPrice { ...props } finalPrice={ finalPrice } />
				) }
			</span>
			{ tooltipText && (
				<InfoPopover position="top" className="display-price__price-tooltip">
					{ tooltipText }
				</InfoPopover>
			) }
			<span className="display-price__details" aria-hidden="true">
				<TimeFrame
					billingTerm={ billingTerm }
					discountedPriceDuration={ discountedPriceDuration }
				/>
			</span>
		</>
	);
};

export default Paid;
