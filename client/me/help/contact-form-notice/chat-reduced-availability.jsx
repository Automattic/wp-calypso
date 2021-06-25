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

const ChatReducedAvailabilityNotice = ( { compact, endsAt, showAt, startsAt } ) => {
	const moment = useLocalizedMoment();

	const currentDate = moment();
	const guessedTimezone = moment.tz.guess();
	const startsAtFormatted = moment.tz( startsAt, guessedTimezone ).format( DATE_FORMAT );
	const endsAtFormatted = moment.tz( endsAt, guessedTimezone ).format( DATE_FORMAT );

	const heading = translate( 'Limited chat availability' );
	let message;

	if ( currentDate.isBefore( startsAt ) ) {
		if ( endsAt ) {
			message = translate(
				'Our live chat availability may be lower than normal from %(startsAt)s until %(endsAt)s.',
				{
					args: { startsAt: startsAtFormatted, endsAt: endsAtFormatted },
				}
			);
		} else {
			message = translate(
				'Our live chat availability may be lower than normal starting %(startsAt)s.',
				{
					args: { startsAt: startsAtFormatted },
				}
			);
		}
		message +=
			' ' +
			translate(
				'If you are unable to access chat during that time, you can send a message from this form and our Happiness Engineers will reply by email as quickly as we can.'
			);
	} else {
		if ( endsAt ) {
			message = translate(
				'Our live chat availability may be lower than normal until %(endsAt)s.',
				{
					args: { endsAt: endsAtFormatted },
				}
			);
		} else {
			message = translate( 'Our live chat availability may temporarily be lower than normal.' );
		}

		message +=
			' ' +
			translate(
				'If you are unable to access chat, send a message from this form and our Happiness Engineers will reply by email as quickly as we can. Thank you for your patience.'
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

export default ChatReducedAvailabilityNotice;
