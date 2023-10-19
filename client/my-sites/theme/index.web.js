import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import { makeLayout, redirectWithoutLocaleParamIfLoggedIn } from 'calypso/controller';
import {
	selectSiteIfLoggedInWithSites,
	hideNavigationIfLoggedInWithNoSites,
	addNavigationIfLoggedIn,
	redirectToLoginIfSiteRequested,
} from 'calypso/my-sites/controller';
import { getTheme } from 'calypso/state/themes/selectors';
import { details, fetchThemeDetailsData } from './controller';

function setTitleIfThemeExisted( context, next ) {
	const theme = getTheme( context.store.getState(), 'wpcom', context.params.slug );
	const themeOrg = getTheme( context.store.getState(), 'wporg', context.params.slug );
	if ( theme || themeOrg ) {
		const themeName = theme?.name ?? themeOrg.name;

		context.getSiteSelectionHeaderText = () =>
			translate( 'Select a site to view {{strong}}%(themeName)s{{/strong}}', {
				args: { themeName },
				components: { strong: <strong /> },
			} );
	}
	next();
}

export default function ( router ) {
	const langParam = getLanguageRouteParam();

	router(
		`/${ langParam }/theme/:slug/:section(setup|support)?/:site_id?`,
		redirectWithoutLocaleParamIfLoggedIn,
		redirectToLoginIfSiteRequested,
		hideNavigationIfLoggedInWithNoSites,
		addNavigationIfLoggedIn,
		setTitleIfThemeExisted,
		selectSiteIfLoggedInWithSites,
		fetchThemeDetailsData,
		details,
		makeLayout
	);
}
