/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import toCurrentLocale from './to-current-locale';

export default function FormattedDate( { date, format } ) {
	const moment = useLocalizedMoment();

	if ( ! moment.isMoment( date ) ) {
		// only make a new moment if we were passed something else
		date = moment( date );
	} else {
		// make sure the date is in the current locale
		date = toCurrentLocale( date );
	}
	return <time dateTime={ date.toISOString( true ) }>{ date.format( format ) }</time>;
}
