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

const LiveChatClosureNotice = ( {
	closureStartDate,
	closureEndDate,
	compact,
	displayDate,
	holidayName,
	translate,
} ) => {
	const currentDate = i18n.moment();

	if (
		! currentDate.isBetween(
			i18n.moment.utc( displayDate ),
			i18n.moment.utc( closureEndDate ).endOf( 'day' )
		)
	) {
		return null;
	}

	const heading = translate( 'Live chat closed for %(holidayName)s', {
		args: { holidayName },
	} );

	let message;

	if ( currentDate.isBefore( i18n.moment.utc( closureStartDate ) ) ) {
		message = translate(
			'Live chat will be closed %(closureStartDate)s through %(closureEndDate)s for the ' +
				'%(holidayName)s holiday. You’ll be able to reach us by email and we’ll get ' +
				'back to you as fast as we can. Live chat will reopen on %(reopenDate)s. Thank you!',
			{
				args: {
					closureStartDate: i18n.moment( closureStartDate ).format( 'dddd, MMMM Do' ),
					closureEndDate: i18n.moment( closureEndDate ).format( 'dddd, MMMM Do' ),
					reopenDate: i18n
						.moment( closureEndDate )
						.add( 1, 'day' )
						.format( 'MMMM Do' ),
					holidayName,
				},
			}
		);
	} else {
		message = translate(
			'Live chat is closed today for the %(holidayName)s holiday. You can reach us ' +
				'by email below and we’ll get back to you as fast as we can. Live chat will ' +
				'reopen on %(reopenDate)s. Thank you!',
			{
				args: {
					reopenDate: i18n
						.moment( closureEndDate )
						.add( 1, 'day' )
						.format( 'MMMM Do' ),
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
