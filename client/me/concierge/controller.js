/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ConciergeMain from './main';
import ConciergeCancel from './cancel';
import BookCalendarStep from './book/calendar-step';
import BookConfirmationStep from './book/confirmation-step';
import BookInfoStep from './book/info-step';
import BookSkeleton from './book/skeleton';
import RescheduleCalendarStep from './reschedule/calendar-step';
import RescheduleConfirmationStep from './reschedule/confirmation-step';
import RescheduleSkeleton from './reschedule/skeleton';
import i18n from 'i18n-calypso';
import { recordTracksEvent } from 'state/analytics/actions';

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

const cancel = ( context, next ) => {
	context.primary = (
		<ConciergeCancel
			appointmentId={ context.params.appointmentId }
			siteSlug={ context.params.siteSlug }
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

const siteSelector = ( context, next ) => {
	context.store.dispatch( recordTracksEvent( 'calypso_concierge_site_selection_step' ) );

	context.getSiteSelectionHeaderText = () =>
		i18n.translate(
			'Please select a site for your {{strong}}Business Concierge Session{{/strong}}',
			{ components: { strong: <strong /> } }
		);
	next();
};

export default {
	book,
	cancel,
	reschedule,
	siteSelector,
};
