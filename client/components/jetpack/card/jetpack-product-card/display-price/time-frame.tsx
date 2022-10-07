import { TERM_MONTHLY } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import type { Duration } from 'calypso/my-sites/plans/jetpack-plans/types';
import type { Moment } from 'moment';

interface TimeFrameProps {
	expiryDate?: Moment;
	billingTerm: Duration;
	discountDurationInMonths?: number;
}

interface RegularTimeFrameProps {
	billingTerm: Duration;
}

interface ExpiringDateTimeFrameProps {
	productExpiryDate: Moment;
}

interface IntroDiscountTimeFrameProps {
	billingTerm: Duration;
	discountDurationInMonths: number;
}

const RegularTimeFrame = ( { billingTerm }: RegularTimeFrameProps ) => {
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

	return (
		<span className="display-price__billing-time-frame">
			<span className="normal">{ billingTermText.normal }</span>
			<span className="compact">{ billingTermText.compact }</span>
		</span>
	);
};

const ExpiringDateTimeFrame = ( { productExpiryDate }: ExpiringDateTimeFrameProps ) => {
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

const IntroDiscountTimeFrame = ( {
	billingTerm,
	discountDurationInMonths,
}: IntroDiscountTimeFrameProps ) => {
	const translate = useTranslate();

	const BillingTermText = useMemo( () => {
		if ( billingTerm === TERM_MONTHLY ) {
			return discountDurationInMonths > 1
				? translate( 'for the first %(months)d months, billed monthly', {
						args: { months: discountDurationInMonths },
				  } )
				: translate( 'for the first month, billed monthly' );
		}

		return discountDurationInMonths > 1
			? translate( 'for the first %(months)d months, billed yearly', {
					args: { months: discountDurationInMonths },
			  } )
			: translate( 'for the first month, billed yearly' );
	}, [ discountDurationInMonths, billingTerm, translate ] );

	return <span className="display-price__billing-time-frame">{ BillingTermText }</span>;
};

const TimeFrame: React.FC< TimeFrameProps > = ( {
	expiryDate,
	billingTerm,
	discountDurationInMonths,
} ) => {
	const moment = useLocalizedMoment();
	const productExpiryDate =
		moment.isMoment( expiryDate ) && expiryDate.isValid() ? expiryDate : null;

	if ( productExpiryDate ) {
		return <ExpiringDateTimeFrame productExpiryDate={ productExpiryDate } />;
	}

	if ( discountDurationInMonths ) {
		return (
			<IntroDiscountTimeFrame
				billingTerm={ billingTerm }
				discountDurationInMonths={ discountDurationInMonths }
			/>
		);
	}

	return <RegularTimeFrame billingTerm={ billingTerm } />;
};

export default TimeFrame;
