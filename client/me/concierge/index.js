import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites } from 'calypso/my-sites/controller';
import controller from './controller';

const redirectToBooking = ( context ) => {
	page.redirect( `/me/quickstart/${ context.params.siteSlug }/book` );
};

export default () => {
	page( '/me/concierge', controller.redirectToQuickStart, makeLayout, clientRender );
	page( '/me/concierge/:siteSlug', redirectToBooking );
	page( '/me/concierge/:siteSlug/*', controller.redirectToQuickStart, makeLayout, clientRender );
	page( '/me/quickstart', controller.siteSelector, siteSelection, sites, makeLayout, clientRender );

	// redirect to booking page after site selection
	page( '/me/quickstart/:siteSlug', redirectToBooking );

	page( '/me/quickstart/:siteSlug/book', controller.book, makeLayout, clientRender );

	page(
		'/me/quickstart/:siteSlug/:appointmentId/cancel',
		controller.cancel,
		makeLayout,
		clientRender
	);

	page(
		'/me/quickstart/:siteSlug/:appointmentId/reschedule',
		controller.reschedule,
		makeLayout,
		clientRender
	);
};
