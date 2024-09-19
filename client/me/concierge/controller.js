import page from '@automattic/calypso-router';
import i18n from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import BookCalendarStep from './book/calendar-step';
import BookConfirmationStep from './book/confirmation-step';
import BookInfoStep from './book/info-step';
import BookSkeleton from './book/skeleton';
import ConciergeCancel from './cancel';
import ConciergeMain from './main';
import RescheduleCalendarStep from './reschedule/calendar-step';
import RescheduleConfirmationStep from './reschedule/confirmation-step';
import RescheduleSkeleton from './reschedule/skeleton';

import './style.scss';

const book = ( context, next ) => {
	context.primary = (
		<ConciergeMain
			analyticsPath="/me/quickstart/:site/book"
			analyticsTitle="Concierge > Book"
			skeleton={ BookSkeleton }
			siteSlug={ context.params.siteSlug }
			steps={ [ BookInfoStep, BookCalendarStep, BookConfirmationStep ] }
			rescheduling={ false }
		/>
	);
	next();
};

const cancel = ( context, next ) => {
	context.primary = (
		<ConciergeCancel
			analyticsPath="/me/quickstart/:site/:appointment/cancel"
			analyticsTitle="Concierge > Cancel"
			appointmentId={ context.params.appointmentId }
			siteSlug={ context.params.siteSlug }
		/>
	);
	next();
};

const reschedule = ( context, next ) => {
	context.primary = (
		<ConciergeMain
			analyticsPath="/me/quickstart/:site/:appointment/reschedule"
			analyticsTitle="Concierge > Reschedule"
			appointmentId={ context.params.appointmentId }
			skeleton={ RescheduleSkeleton }
			siteSlug={ context.params.siteSlug }
			steps={ [ RescheduleCalendarStep, RescheduleConfirmationStep ] }
			rescheduling
		/>
	);
	next();
};

const siteSelector = ( context, next ) => {
	context.store.dispatch( recordTracksEvent( 'calypso_concierge_site_selection_step' ) );

	context.getSiteSelectionHeaderText = () =>
		i18n.translate( 'Select a site for your {{strong}}Quick Start Session{{/strong}}', {
			components: { strong: <strong /> },
		} );
	next();
};

const redirectToQuickStart = ( context, next ) => {
	const newPath = context.path.replace( '/me/concierge', '/me/quickstart' );
	page.redirect( newPath );
	next();
};

export default {
	book,
	cancel,
	reschedule,
	siteSelector,
	redirectToQuickStart,
};
