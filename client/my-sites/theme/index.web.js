import { translate } from 'i18n-calypso';
import {
	makeLayout,
	redirectLoggedOut,
	redirectWithoutLocaleParamIfLoggedIn,
} from 'calypso/controller';
import { getLanguageRouteParam } from 'calypso/lib/i18n-utils';
import { createNavigation, selectSiteIfLoggedIn, siteSelection } from 'calypso/my-sites/controller';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getTheme } from 'calypso/state/themes/selectors';
import { details, fetchThemeDetailsData } from './controller';

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

function setTitleAndSelectSiteIfLoggedIn( context, next ) {
	const theme = getTheme( context.store.getState(), 'wpcom', context.params.slug );
	if ( theme ) {
		const themeName = theme.name;

		context.getSiteSelectionHeaderText = () =>
			translate( 'Select a site to view {{strong}}%(themeName)s{{/strong}}', {
				args: { themeName },
				components: { strong: <strong /> },
			} );
	}
	selectSiteIfLoggedIn( context, next );
}

export default function ( router ) {
	const langParam = getLanguageRouteParam();

	router(
		`/${ langParam }/theme/:slug/:section(setup|support)?`,
		redirectWithoutLocaleParamIfLoggedIn,
		redirectToLoginIfSiteRequested,
		setTitleAndSelectSiteIfLoggedIn,
		fetchThemeDetailsData,
		details,
		makeLayout
	);

	router(
		`/${ langParam }/theme/:slug/:section(setup|support)?/:site_id`,
		redirectWithoutLocaleParamIfLoggedIn,
		redirectToLoginIfSiteRequested,
		addNavigationIfLoggedIn,
		siteSelection,
		fetchThemeDetailsData,
		details,
		makeLayout
	);
}
