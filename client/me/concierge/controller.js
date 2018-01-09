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

export default {
	book,
};
