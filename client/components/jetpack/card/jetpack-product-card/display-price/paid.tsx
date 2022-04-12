import { TranslateResult } from 'i18n-calypso';
import InfoPopover from 'calypso/components/info-popover';
import PlanPrice from 'calypso/my-sites/plan-price';
import TimeFrame from './time-frame';
import type { Duration } from 'calypso/my-sites/plans/jetpack-plans/types';
import type { Moment } from 'moment';
import type { ReactNode } from 'react';

type OwnProps = {
	discountedPrice?: number;
	originalPrice?: number;
	pricesAreFetching?: boolean | null;
	billingTerm: Duration;
	currencyCode?: string | null;
	displayFrom?: boolean;
	tooltipText?: TranslateResult | ReactNode;
	expiryDate?: Moment;
};

const Paid: React.FC< OwnProps > = ( {
	discountedPrice,
	originalPrice,
	pricesAreFetching,
	billingTerm,
	currencyCode,
	displayFrom,
	tooltipText,
	expiryDate,
} ) => {
	const finalPrice = discountedPrice ?? originalPrice;

	// Placeholder (while prices are loading)
	if ( ! currencyCode || ! originalPrice || pricesAreFetching ) {
		return (
			<>
				<PlanPrice
					original
					className="display-price__original-price"
					rawPrice={ 0.01 }
					currencyCode={ '$' }
				/>
				{ /* Remove this secondary <PlanPrice/> placeholder if we're not showing discounted prices */ }
				<PlanPrice discounted rawPrice={ 0.01 } currencyCode={ '$' } />
				<TimeFrame expiryDate={ expiryDate } billingTerm={ billingTerm } />
			</>
		);
	}

	const renderDiscountedPrice = () => {
		return (
			<>
				{ /*
				 * Price should be displayed from left-to-right, even in right-to-left
				 * languages. `PlanPrice` seems to keep the ltr direction no matter
				 * what when seen in the dev docs page, but somehow it doesn't in
				 * the pricing page.
				 */ }
				<span dir="ltr">
					<PlanPrice
						original
						className="display-price__original-price"
						rawPrice={ originalPrice as number }
						currencyCode={ currencyCode }
					/>
				</span>
				<span dir="ltr">
					<PlanPrice discounted rawPrice={ finalPrice as number } currencyCode={ currencyCode } />
				</span>
			</>
		);
	};

	const renderNonDiscountedPrice = () => (
		<span dir="ltr">
			<PlanPrice discounted rawPrice={ finalPrice as number } currencyCode={ currencyCode } />
		</span>
	);

	const renderPrice = () =>
		finalPrice && finalPrice < originalPrice ? renderDiscountedPrice() : renderNonDiscountedPrice();

	return (
		<>
			{ displayFrom && <span className="display-price__from">from</span> }
			{ renderPrice() }
			{ tooltipText && (
				<InfoPopover position="top" className="display-price__price-tooltip">
					{ tooltipText }
				</InfoPopover>
			) }
			<TimeFrame expiryDate={ expiryDate } billingTerm={ billingTerm } />
		</>
	);
};

export default Paid;
