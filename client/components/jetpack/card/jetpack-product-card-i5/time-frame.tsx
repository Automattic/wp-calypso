/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { durationToText } from 'calypso/my-sites/plans/jetpack-plans/utils';

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

	return productExpiryDate ? (
		<time
			className="jetpack-product-card-i5__expiration-date"
			dateTime={ productExpiryDate.format( 'YYYY-DD-YY' ) }
		>
			{ translate( 'expires %(date)s', {
				args: {
					date: productExpiryDate.format( 'L' ),
				},
			} ) }
		</time>
	) : (
		<span className="jetpack-product-card-i5__billing-time-frame">
			{ durationToText( billingTerm ) }
		</span>
	);
};

export default JetpackProductCardTimeFrame;
