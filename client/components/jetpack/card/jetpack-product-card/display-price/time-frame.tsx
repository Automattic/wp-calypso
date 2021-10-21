import { TERM_MONTHLY } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import type { Duration } from 'calypso/my-sites/plans/jetpack-plans/types';
import type { Moment } from 'moment';

interface TimeFrameProps {
	expiryDate?: Moment;
	billingTerm: Duration;
}

const TimeFrame: React.FC< TimeFrameProps > = ( { expiryDate, billingTerm } ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const productExpiryDate =
		moment.isMoment( expiryDate ) && expiryDate.isValid() ? expiryDate : null;

	const billingTermText = useMemo( () => {
		if ( billingTerm === TERM_MONTHLY ) {
			return translate( '/month, paid monthly' );
		}

		return translate( '/month, billed yearly' );
	}, [ billingTerm, translate ] );

	return productExpiryDate ? (
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
	) : (
		<span className="display-price__billing-time-frame">{ billingTermText }</span>
	);
};

export default TimeFrame;
