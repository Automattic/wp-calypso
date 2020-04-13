/**
 * External dependencies
 */

import React from 'react';
import { translate } from 'i18n-calypso';
import 'moment-timezone'; // monkey patches the existing moment.js

/**
 * Internal dependencies
 */
import ContactFormNotice from 'me/help/contact-form-notice/index';
import { useLocalizedMoment } from 'components/localized-moment';

const DATE_FORMAT = 'LLL';

export const easterHolidayName = translate( 'Easter', {
	context: 'Holiday name',
} );

export const xmasHolidayName = translate( 'Christmas', {
	context: 'Holiday name',
} );

const LiveChatClosureNotice = ( { closesAt, compact, displayAt, holidayName, reopensAt } ) => {
	const moment = useLocalizedMoment();

	const currentDate = moment();
	const guessedTimezone = moment.tz.guess();

	let heading, message;

	if ( currentDate.isBefore( closesAt ) ) {
		heading = translate( 'Live chat will be closed for %(holidayName)s', {
			args: { holidayName },
		} );

		message = translate(
			'Live chat will be closed for %(holidayName)s from %(closesAt)s until %(reopensAt)s. ' +
				'You’ll be able to reach us by email and we’ll get back to you as fast as we can. Thank you!',
			{
				args: {
					closesAt: moment.tz( closesAt, guessedTimezone ).format( DATE_FORMAT ),
					reopensAt: moment.tz( reopensAt, guessedTimezone ).format( DATE_FORMAT ),
					holidayName,
				},
			}
		);
	} else {
		heading = translate( 'Live chat closed for %(holidayName)s', {
			args: { holidayName },
		} );

		message = translate(
			'Live chat is closed for %(holidayName)s and will reopen %(reopensAt)s. ' +
				'You can reach us by email below and we’ll get back to you as fast as we can. Thank you!',
			{
				args: {
					reopensAt: moment.tz( reopensAt, guessedTimezone ).format( DATE_FORMAT ),
					holidayName,
				},
			}
		);
	}

	return (
		<ContactFormNotice
			showAt={ displayAt }
			hideAt={ reopensAt }
			heading={ heading }
			message={ <p>{ message }</p> }
			compact={ compact }
		/>
	);
};

export default LiveChatClosureNotice;
