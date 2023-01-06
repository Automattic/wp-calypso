import { isMagnificentLocale, addLocaleToPath } from '@automattic/i18n-utils';
import { mapValues } from 'lodash';
import titlecase from 'to-title-case';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';

export function trackClick( componentName, eventName, verb = 'click' ) {
	const stat = `${ componentName } ${ eventName } ${ verb }`;
	gaRecordEvent( 'Themes', titlecase( stat ) );
}

export function addTracking( options ) {
	return mapValues( options, appendActionTracking );
}

function appendActionTracking( option, name ) {
	const { action } = option;

	return Object.assign( {}, option, {
		action: ( t, context ) => {
			action && action( t );
			context && trackClick( context, name );
		},
	} );
}

export function getAnalyticsData( path, { filter, vertical, tier, site_id } ) {
	let analyticsPath = '/themes';
	let analyticsPageTitle = 'Themes';

	if ( vertical ) {
		analyticsPath += `/${ vertical }`;
	}

	if ( tier ) {
		analyticsPath += `/${ tier }`;
	}

	if ( filter ) {
		analyticsPath += `/filter/${ filter }`;
	}

	if ( site_id ) {
		analyticsPath += '/:site';
		analyticsPageTitle += ' > Single Site';
	}

	if ( tier ) {
		analyticsPageTitle += ` > Type > ${ titlecase( tier ) }`;
	}

	return { analyticsPath, analyticsPageTitle };
}

export function localizeThemesPath( path, locale, isLoggedOut = true ) {
	const shouldLocalizePath = isLoggedOut && isMagnificentLocale( locale );

	if ( ! shouldLocalizePath ) {
		return path;
	}

	if ( path.startsWith( '/theme' ) ) {
		return `/${ locale }${ path }`;
	}

	if ( path.startsWith( '/start/with-theme' ) ) {
		return addLocaleToPath( path, locale );
	}

	return path;
}

/**
 * Creates the billing product slug for a given theme ID.
 *
 * @param themeId Theme ID
 * @returns string
 */
export function marketplaceThemeBillingProductSlug( themeId ) {
	return `wp-mp-theme-${ themeId }`;
}
