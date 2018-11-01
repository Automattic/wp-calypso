/** @format */
/**
 * External dependencies
 *
 */

import React from 'react';

/**
 * Internal dependencies
 */
import withMoment from 'components/with-localized-moment';
import toCurrentLocale from './to-current-locale';

function FormattedDate( { date, moment, format } ) {
	if ( ! moment.isMoment( date ) ) {
		// only make a new moment if we were passed something else
		date = moment( date );
	} else {
		// make sure the date is in the current locale
		date = toCurrentLocale( date );
	}
	return <time dateTime={ date.toISOString( true ) }>{ date.format( format ) }</time>;
}

FormattedDate.displayName = 'FormattedDate';

export default withMoment( FormattedDate );
