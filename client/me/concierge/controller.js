/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ConciergeMain from './main';
import BookCalendarStep from './book/calendar-step';
import BookConfirmationStep from './book/confirmation-step';
import BookInfoStep from './book/info-step';
import BookSkeleton from './book/skeleton';
import RescheduleCalendarStep from './reschedule/calendar-step';
import RescheduleConfirmationStep from './reschedule/confirmation-step';
import RescheduleSkeleton from './reschedule/skeleton';

const book = ( context, next ) => {
	context.primary = (
		<ConciergeMain
			skeleton={ BookSkeleton }
			siteSlug={ context.params.siteSlug }
			steps={ [ BookInfoStep, BookCalendarStep, BookConfirmationStep ] }
		/>
	);
	next();
};

const reschedule = ( context, next ) => {
	context.primary = (
		<ConciergeMain
			appointmentId={ context.params.appointmentId }
			skeleton={ RescheduleSkeleton }
			siteSlug={ context.params.siteSlug }
			steps={ [ RescheduleCalendarStep, RescheduleConfirmationStep ] }
		/>
	);
	next();
};

export default {
	book,
	reschedule,
};
