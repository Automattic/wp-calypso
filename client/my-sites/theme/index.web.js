/**
 * Internal dependencies
 */
import { makeLayout, redirectLoggedOut } from 'calypso/controller';
import { details, fetchThemeDetailsData } from './controller';
import { siteSelection } from 'calypso/my-sites/controller';
import { getLanguageRouteParam } from 'calypso/lib/i18n-utils';

function redirectToLoginIfSiteRequested( context, next ) {
	if ( context.params.site_id ) {
		redirectLoggedOut( context, next );
		return;
	}

	next();
}

export default function ( router ) {
	const langParam = getLanguageRouteParam();

	router(
		`/${ langParam }/theme/:slug/:section(setup|support)?/:site_id?`,
		redirectToLoginIfSiteRequested,
		siteSelection,
		fetchThemeDetailsData,
		details,
		makeLayout
	);
}
