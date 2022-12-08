import { TERM_MONTHLY } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import type { Duration } from 'calypso/my-sites/plans/jetpack-plans/types';
import type { Moment } from 'moment';

interface TimeFrameProps {
	expiryDate?: Moment;
	billingTerm: Duration;
	discountedPriceDuration?: number;
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
	forScreenReader,
} ) => {
	const translate = useTranslate();

	const opts = {
		count: discountedPriceDuration,
		args: {
			months: discountedPriceDuration,
		},
	};

	/* eslint-disable wpcalypso/i18n-mismatched-placeholders */
	let text = translate(
		'for the first month, billed yearly',
		'for the first %(months)d months, billed yearly',
		opts
	);

	if ( billingTerm === TERM_MONTHLY ) {
		text = translate(
			'for the first month, billed monthly',
			'for the first %(months)d months, billed monthly',
			opts
		);
	}
	/* eslint-enable wpcalypso/i18n-mismatched-placeholders */

	if ( forScreenReader ) {
		return <>{ text }</>;
	}

	return <span className="display-price__billing-time-frame">{ text }</span>;
};

const TimeFrame: React.FC< TimeFrameProps & A11yProps > = ( {
	expiryDate,
	billingTerm,
	discountedPriceDuration,
	forScreenReader,
} ) => {
	const moment = useLocalizedMoment();
	const productExpiryDate =
		moment.isMoment( expiryDate ) && expiryDate.isValid() ? expiryDate : null;

	if ( productExpiryDate ) {
		return <ExpiringDateTimeFrame productExpiryDate={ productExpiryDate } />;
	}

	if ( discountedPriceDuration ) {
		return (
			<PartialDiscountTimeFrame
				billingTerm={ billingTerm }
				discountedPriceDuration={ discountedPriceDuration }
				forScreenReader={ forScreenReader }
			/>
		);
	}

	return <RegularTimeFrame billingTerm={ billingTerm } forScreenReader={ forScreenReader } />;
};

export default TimeFrame;
