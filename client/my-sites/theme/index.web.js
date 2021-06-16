/**
 * Internal dependencies
 */
import {
	makeLayout,
	redirectLoggedOut,
	redirectWithoutLocaleParamIfLoggedIn,
} from 'calypso/controller';
import { details, fetchThemeDetailsData } from './controller';
import { createNavigation, siteSelection } from 'calypso/my-sites/controller';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getLanguageRouteParam } from 'calypso/lib/i18n-utils';

function redirectToLoginIfSiteRequested( context, next ) {
	if ( context.params.site_id ) {
		redirectLoggedOut( context, next );
		return;
	}

	next();
}

function addNavigationIfLoggedIn( context, next ) {
	const state = context.store.getState();
	if ( isUserLoggedIn( state ) ) {
		context.secondary = createNavigation( context );
	}
	next();
}

export default function ( router ) {
	const langParam = getLanguageRouteParam();

	router(
		`/${ langParam }/theme/:slug/:section(setup|support)?/:site_id?`,
		redirectWithoutLocaleParamIfLoggedIn,
		redirectToLoginIfSiteRequested,
		addNavigationIfLoggedIn,
		siteSelection,
		fetchThemeDetailsData,
		details,
		makeLayout
	);
}
