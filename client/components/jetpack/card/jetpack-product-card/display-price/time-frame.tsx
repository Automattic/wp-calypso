import { TERM_MONTHLY } from '@automattic/calypso-products';
import i18n, { getLocaleSlug, useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import type { Duration } from 'calypso/my-sites/plans/jetpack-plans/types';
import type { Moment } from 'moment';

interface TimeFrameProps {
	expiryDate?: Moment;
	billingTerm: Duration;
	discountedPriceDuration?: number;
	formattedOriginalPrice?: string;
	isDiscounted?: boolean;
}

interface RegularTimeFrameProps {
	billingTerm: Duration;
}

interface ExpiringDateTimeFrameProps {
	productExpiryDate: Moment;
}

interface PartialDiscountTimeFrameProps {
	billingTerm: Duration;
	discountedPriceDuration: number;
	formattedOriginalPrice: string;
}

interface A11yProps {
	forScreenReader?: boolean;
}

const RegularTimeFrame: React.FC< RegularTimeFrameProps & A11yProps > = ( {
	billingTerm,
	forScreenReader,
} ) => {
	const translate = useTranslate();

	const billingTermText = useMemo( () => {
		if ( billingTerm === TERM_MONTHLY ) {
			return {
				normal: translate( '/month, billed monthly' ),
				compact: translate( '/mo, billed monthly', {
					comment: '/mo should be as compact as possible',
				} ),
			};
		}

		return {
			normal: translate( '/month, billed yearly' ),
			compact: translate( '/mo, billed yearly', {
				comment: '/mo should be as compact as possible',
			} ),
		};
	}, [ billingTerm, translate ] );

	if ( forScreenReader ) {
		return (
			<>
				{ billingTerm === TERM_MONTHLY
					? translate( 'per month, billed monthly' )
					: translate( 'per month, billed yearly' ) }
			</>
		);
	}

	return (
		<span className="display-price__billing-time-frame">
			<span className="normal">{ billingTermText.normal }</span>
			<span className="compact">{ billingTermText.compact }</span>
		</span>
	);
};

const ExpiringDateTimeFrame: React.FC< ExpiringDateTimeFrameProps > = ( { productExpiryDate } ) => {
	const translate = useTranslate();

	return (
		<time
			className="display-price__expiration-date"
			dateTime={ productExpiryDate.format( 'YYYY-DD-YY' ) }
		>
			{ translate( 'expires %(date)s', {
				args: {
					date: productExpiryDate.format( 'L' ),
				},
			} ) }
		</time>
	);
};

const PartialDiscountTimeFrame: React.FC< PartialDiscountTimeFrameProps & A11yProps > = ( {
	billingTerm,
	discountedPriceDuration,
	formattedOriginalPrice,
	forScreenReader,
} ) => {
	const translate = useTranslate();
	let text;

	const opts = {
		count: discountedPriceDuration,
		args: {
			months: discountedPriceDuration,
			original_price: formattedOriginalPrice,
		},
	};

	/* eslint-disable wpcalypso/i18n-mismatched-placeholders */
	if ( billingTerm === TERM_MONTHLY ) {
		if (
			getLocaleSlug() === 'en' ||
			getLocaleSlug() === 'en-gb' ||
			i18n.hasTranslation( 'for the first month, then %(original_price)s /month, billed monthly' )
		) {
			text = translate(
				'for the first month, then %(original_price)s /month, billed monthly',
				'for the first %(months)d months, then %(original_price)s /month, billed monthly',
				opts
			);
		} else {
			text = translate(
				'for the first month, billed monthly',
				'for the first %(months)d months, billed monthly',
				opts
			);
		}
	} else {
		// eslint-disable-next-line no-lonely-if
		if (
			getLocaleSlug() === 'en' ||
			getLocaleSlug() === 'en-gb' ||
			i18n.hasTranslation( 'for the first month, then %(original_price)s /month, billed yearly' )
		) {
			text = translate(
				'for the first month, then %(original_price)s /month, billed yearly',
				'for the first %(months)d months, then %(original_price)s /month, billed yearly',
				opts
			);
		} else {
			text = translate(
				'for the first month, billed yearly',
				'for the first %(months)d months, billed yearly',
				opts
			);
		}
	}

	if ( forScreenReader ) {
		return <>{ text }</>;
	}

	return <span className="display-price__billing-time-frame">{ text }</span>;
};

const OneYearDiscountTimeFrame: React.FC< A11yProps > = ( { forScreenReader } ) => {
	const translate = useTranslate();
	const text = translate( 'per month for the first year, billed yearly' );

	if ( forScreenReader ) {
		return <>{ text }</>;
	}

	return <span className="display-price__billing-time-frame">{ text }</span>;
};

const TimeFrame: React.FC< TimeFrameProps & A11yProps > = ( {
	expiryDate,
	billingTerm,
	discountedPriceDuration,
	formattedOriginalPrice,
	forScreenReader,
	isDiscounted,
} ) => {
	const moment = useLocalizedMoment();
	const productExpiryDate =
		moment.isMoment( expiryDate ) && expiryDate.isValid() ? expiryDate : null;

	if ( productExpiryDate ) {
		return <ExpiringDateTimeFrame productExpiryDate={ productExpiryDate } />;
	}

	// `1 === discountedPriceDuration` condition taken from client/my-sites/plans/jetpack-plans/product-lightbox/payment-plan.tsx:56
	if ( isDiscounted ) {
		if ( 1 === discountedPriceDuration && formattedOriginalPrice ) {
			return (
				<PartialDiscountTimeFrame
					billingTerm={ billingTerm }
					discountedPriceDuration={ discountedPriceDuration }
					forScreenReader={ forScreenReader }
					formattedOriginalPrice={ formattedOriginalPrice }
				/>
			);
		}

		return <OneYearDiscountTimeFrame forScreenReader={ forScreenReader } />;
	}

	return <RegularTimeFrame billingTerm={ billingTerm } forScreenReader={ forScreenReader } />;
};

export default TimeFrame;
