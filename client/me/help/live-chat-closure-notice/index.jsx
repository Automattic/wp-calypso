/** @format */

/**
 * External dependencies
 */

import React from 'react';
import i18n, { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import FormSectionHeading from 'components/forms/form-section-heading';

/**
 * Style dependencies
 */
import './style.scss';

const DATE_FORMAT = 'MMMM D h:mma z';

const LiveChatClosureNotice = ( {
	closesAt,
	compact,
	displayAt,
	holidayName,
	reopensAt,
	translate,
} ) => {
	const currentDate = i18n.moment();
	const guessedTimezone = i18n.moment.tz.guess();

	if ( ! currentDate.isBetween( i18n.moment( displayAt ), i18n.moment( reopensAt ) ) ) {
		return null;
	}

	const heading = translate( 'Live chat closed for %(holidayName)s', {
		args: { holidayName },
	} );

	let message;

	if ( currentDate.isBefore( closesAt ) ) {
		message = translate(
			'Live chat will be closed for %(holidayName)s from %(closesAt)s until %(reopensAt)s. ' +
				'You’ll be able to reach us by email and we’ll get back to you as fast as we can. Thank you!',
			{
				args: {
					closesAt: i18n.moment.tz( closesAt, guessedTimezone ).format( DATE_FORMAT ),
					reopensAt: i18n.moment.tz( reopensAt, guessedTimezone ).format( DATE_FORMAT ),
					holidayName,
				},
			}
		);
	} else {
		message = translate(
			'Live chat is closed for %(holidayName)s and will reopen %(reopensAt)s. ' +
				'You can reach us by email below and we’ll get back to you as fast as we can. Thank you!',
			{
				args: {
					reopensAt: i18n.moment.tz( reopensAt, guessedTimezone ).format( DATE_FORMAT ),
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

export default localize( LiveChatClosureNotice );
