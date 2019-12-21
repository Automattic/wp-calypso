/**
 * External dependencies
 */

import React from 'react';
import { useTranslate } from 'i18n-calypso';
import 'moment-timezone'; // monkey patches the existing moment.js

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import FormSectionHeading from 'components/forms/form-section-heading';
import { useLocalizedMoment } from 'components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

const DATE_FORMAT = 'LLL';

const LiveChatClosureNotice = ( { closesAt, compact, displayAt, holidayName, reopensAt } ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const currentDate = moment();
	const guessedTimezone = moment.tz.guess();

	if ( ! currentDate.isBetween( displayAt, reopensAt ) ) {
		return null;
	}

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

	if ( compact ) {
		return (
			<FoldableCard
				className="live-chat-closure-notice"
				clickableHeader={ true }
				compact={ true }
				header={ heading }
			>
				{ message }
			</FoldableCard>
		);
	}

	return (
		<div className="live-chat-closure-notice">
			<FormSectionHeading>{ heading }</FormSectionHeading>
			<div>
				<p>{ message }</p>
			</div>
			<hr />
		</div>
	);
};

export default LiveChatClosureNotice;
