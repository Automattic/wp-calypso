/**
 * External dependencies
 */

import React from 'react';
import { translate } from 'i18n-calypso';
import 'moment-timezone'; // monkey patches the existing moment.js

/**
 * Internal dependencies
 */
import ContactFormNotice from 'calypso/me/help/contact-form-notice/index';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

const DATE_FORMAT = 'LLL';

const ChatGenericClosureNotice = ( { compact, endsAt, showAt, startsAt } ) => {
	const moment = useLocalizedMoment();

	const currentDate = moment();
	const guessedTimezone = moment.tz.guess();
	const startsAtFormatted = moment.tz( startsAt, guessedTimezone ).format( DATE_FORMAT );
	const endsAtFormatted = moment.tz( endsAt, guessedTimezone ).format( DATE_FORMAT );

	let heading;
	let message;

	if ( currentDate.isBefore( startsAt ) ) {
		heading = translate( 'Upcoming live chat closure' );
		if ( endsAt ) {
			message = translate( 'Live chat will be closed from %(startsAt)s until %(endsAt)s.', {
				args: { startsAt: startsAtFormatted, endsAt: endsAtFormatted },
			} );
		} else {
			message = translate( 'Live chat will be temporarily closed starting %(startsAt)s.', {
				args: { startsAt: startsAtFormatted },
			} );
		}
		message +=
			' ' +
			translate(
				'If you need to get in touch during that time, you can send a message from this form and our Happiness Engineers will reply by email as quickly as we can.'
			);
	} else {
		heading = translate( 'Live chat is closed' );
		if ( endsAt ) {
			message = translate( 'Live chat is closed until %(endsAt)s.', {
				args: { endsAt: endsAtFormatted },
			} );
		} else {
			message = translate( 'Live chat is temporarily closed.' );
		}

		message +=
			' ' +
			translate(
				'If you need to get in touch, send a message from this form and our Happiness Engineers will reply by email as quickly as we can. Thank you for your patience.'
			);
	}

	return (
		<ContactFormNotice
			showAt={ showAt }
			hideAt={ endsAt }
			heading={ heading }
			message={ <p>{ message }</p> }
			compact={ compact }
		/>
	);
};

export default ChatGenericClosureNotice;
