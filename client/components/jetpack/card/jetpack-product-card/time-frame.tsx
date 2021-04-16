/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useDurationText } from 'calypso/my-sites/plans/jetpack-plans/utils/ui';

/**
 * Type dependencies
 */
import type { Moment } from 'moment';
import type { Duration } from 'calypso/my-sites/plans/jetpack-plans/types';

interface Props {
	expiryDate?: Moment;
	billingTerm: Duration;
}

const JetpackProductCardTimeFrame: React.FC< Props > = ( { expiryDate, billingTerm } ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const productExpiryDate =
		moment.isMoment( expiryDate ) && expiryDate.isValid() ? expiryDate : null;

	const durationText = useDurationText( billingTerm );

	return productExpiryDate ? (
		<time
			className="jetpack-product-card__expiration-date"
			dateTime={ productExpiryDate.format( 'YYYY-MM-DD' ) }
		>
			{ translate( 'expires %(date)s', {
				args: {
					date: productExpiryDate.format( 'L' ),
				},
			} ) }
		</time>
	) : (
		<span className="jetpack-product-card__billing-time-frame">{ durationText }</span>
	);
};

export default JetpackProductCardTimeFrame;
