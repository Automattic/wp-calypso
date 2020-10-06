/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites } from 'calypso/my-sites/controller';

const redirectToBooking = ( context ) => {
	page.redirect( `/me/concierge/${ context.params.siteSlug }/book` );
};

export default () => {
	page( '/me/concierge', controller.siteSelector, siteSelection, sites, makeLayout, clientRender );

	// redirect to booking page after site selection
	page( '/me/concierge/:siteSlug', redirectToBooking );

	page( '/me/concierge/:siteSlug/book', controller.book, makeLayout, clientRender );

	page(
		'/me/concierge/:siteSlug/:appointmentId/cancel',
		controller.cancel,
		makeLayout,
		clientRender
	);

	page(
		'/me/concierge/:siteSlug/:appointmentId/reschedule',
		controller.reschedule,
		makeLayout,
		clientRender
	);
};
