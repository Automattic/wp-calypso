import { TERM_ANNUALLY } from '@automattic/calypso-products';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import InfoPopover from 'calypso/components/info-popover';
import PlanPrice from 'calypso/my-sites/plan-price';
import { INTRO_PRICING_DISCOUNT_PERCENTAGE } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { getJetpackSaleCouponDiscountRatio } from 'calypso/state/marketing/selectors';
import TimeFrame from './time-frame';
import type { Duration } from 'calypso/my-sites/plans/jetpack-plans/types';
import type { Moment } from 'moment';
import type { ReactNode } from 'react';

type OwnProps = {
	discountedPrice?: number;
	originalPrice: number;
	billingTerm: Duration;
	currencyCode?: string | null;
	displayFrom?: boolean;
	tooltipText?: TranslateResult | ReactNode;
	expiryDate?: Moment;
	hideSavingLabel?: boolean;
};

const Paid: React.FC< OwnProps > = ( {
	discountedPrice,
	originalPrice,
	billingTerm,
	currencyCode,
	displayFrom,
	tooltipText,
	expiryDate,
	hideSavingLabel,
} ) => {
	const translate = useTranslate();

	const jetpackSaleDiscountRatio = useSelector( getJetpackSaleCouponDiscountRatio );
	const DISCOUNT_PERCENTAGE =
		billingTerm === TERM_ANNUALLY && jetpackSaleDiscountRatio
			? 1 - jetpackSaleDiscountRatio
			: 1 - INTRO_PRICING_DISCOUNT_PERCENTAGE / 100;

	const couponOriginalPrice = parseFloat( ( discountedPrice ?? originalPrice ).toFixed( 2 ) );
	const couponDiscountedPrice = parseFloat(
		( ( discountedPrice ?? originalPrice ) * DISCOUNT_PERCENTAGE ).toFixed( 2 )
	);

	const discountElt =
		billingTerm === TERM_ANNUALLY
			? translate( 'Save %(percent)d%% for the first year *', {
					args: {
						percent: ( ( originalPrice - couponDiscountedPrice ) / originalPrice ) * 100,
					},
					comment: '* clause describing the displayed price adjustment',
			  } )
			: translate( 'Switch to yearly to save %(percent)d%% *', {
					args: {
						percent: INTRO_PRICING_DISCOUNT_PERCENTAGE,
					},
					comment: '* clause describing the displayed price adjustment',
			  } );

	const loading = ! currencyCode || ! originalPrice;
	if ( loading ) {
		return (
			<>
				<div className="display-price__price-placeholder" />
				<div className="display-price__time-frame-placeholder" />
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
						rawPrice={
							( billingTerm === TERM_ANNUALLY ? originalPrice : couponOriginalPrice ) as number
						}
						currencyCode={ currencyCode }
					/>
				</span>
				<span dir="ltr">
					<PlanPrice
						discounted
						rawPrice={ couponDiscountedPrice as number }
						currencyCode={ currencyCode }
					/>
				</span>
			</>
		);
	};

	const renderNonDiscountedPrice = () => (
		<span dir="ltr">
			<PlanPrice
				discounted
				rawPrice={
					( billingTerm === TERM_ANNUALLY ? originalPrice : couponOriginalPrice ) as number
				}
				currencyCode={ currencyCode }
			/>
		</span>
	);

	const renderPrice = () =>
		billingTerm === TERM_ANNUALLY ? renderDiscountedPrice() : renderNonDiscountedPrice();

	const getSavingsLabelClassName = () =>
		billingTerm === TERM_ANNUALLY ? 'display-price__you-save' : 'display-price__no-savings';

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
			{ ! hideSavingLabel && <span className={ getSavingsLabelClassName() }>{ discountElt }</span> }
		</>
	);
};

export default Paid;
