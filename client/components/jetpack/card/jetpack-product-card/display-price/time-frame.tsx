import { isEnabled } from '@automattic/calypso-config';
import { TERM_MONTHLY } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { createElement, useMemo } from 'react';
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
		const isNewFormat = isEnabled( 'jetpack/pricing-page-rework-v1' ); // TO-DO remove this flag once we have the new translation in production

		if ( billingTerm === TERM_MONTHLY ) {
			return isNewFormat
				? translate( '/mo{{span}}nth{{/span}}, billed monthly', {
						components: {
							span: createElement( 'span' ),
						},
				  } )
				: translate( '/month, billed monthly' );
		}

		return isNewFormat
			? translate( '/mo{{span}}nth{{/span}}, billed yearly', {
					components: {
						span: createElement( 'span' ),
					},
			  } )
			: translate( '/month, billed yearly' );
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
			<span className="display-price__billing-time-frame">{ billingTermText }</span>
		</div>
	);
};

export default TimeFrame;
