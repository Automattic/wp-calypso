/**
 * Internal dependencies
 */
import { makeLayout, redirectLoggedOut } from 'calypso/controller';
import { details, fetchThemeDetailsData } from './controller';
import { siteSelection } from 'calypso/my-sites/controller';

function redirectToLoginIfSiteRequested( context, next ) {
	if ( context.params.site_id ) {
		redirectLoggedOut( context, next );
		return;
	}

	next();
}

export default function ( router ) {
	router(
		'/theme/:slug/:section(setup|support)?/:site_id?',
		redirectToLoginIfSiteRequested,
		siteSelection,
		fetchThemeDetailsData,
		details,
		makeLayout
	);
}
