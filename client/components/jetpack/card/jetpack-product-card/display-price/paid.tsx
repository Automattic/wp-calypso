import { translate, TranslateResult } from 'i18n-calypso';
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
	isPricingPageTreatment202204?: boolean;
	isPricingPageTest202204Loading?: boolean;
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
	isPricingPageTreatment202204,
	isPricingPageTest202204Loading,
} ) => {
	const finalPrice = discountedPrice ?? originalPrice;

	// Placeholder (while prices are loading)
	if ( ! currencyCode || ! originalPrice || pricesAreFetching || isPricingPageTest202204Loading ) {
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
		/*
		 * Price should be displayed from left-to-right, even in right-to-left
		 * languages. `PlanPrice` seems to keep the ltr direction no matter
		 * what when seen in the dev docs page, but somehow it doesn't in
		 * the pricing page.
		 */
		if ( isPricingPageTreatment202204 ) {
			return (
				<>
					<span dir="ltr">
						<PlanPrice
							discounted
							className="display-price__discounted-price"
							rawPrice={ finalPrice as number }
							currencyCode={ currencyCode }
							displayShortPerMonthNotation
						/>
					</span>
					<br />
					<span dir="ltr">
						<PlanPrice
							original
							className="display-price__original-price display-price__original-price-small"
							rawPrice={ originalPrice as number }
							currencyCode={ currencyCode }
							originalPricePrefix={ translate( 'Normally', {
								comment: 'A way to describe a price before a discount is applied',
							} ) }
						/>
					</span>
				</>
			);
		}

		return (
			<>
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
			{ ! isPricingPageTreatment202204 && (
				<TimeFrame expiryDate={ expiryDate } billingTerm={ billingTerm } />
			) }
		</>
	);
};

export default Paid;
