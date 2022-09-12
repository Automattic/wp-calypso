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

	return productExpiryDate ? (
		<div>
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
		</div>
	) : (
		<div>
			<span className="display-price__billing-time-frame">
				<span className="normal">{ billingTermText.normal }</span>
				<span className="compact">{ billingTermText.compact }</span>
			</span>
		</div>
	);
};

export default TimeFrame;
