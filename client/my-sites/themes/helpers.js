/**
 * DEPRECATED. Use client/state/themes/selectors instead.
 */

/**
 * External dependencies
 */
import analytics from 'lib/analytics';
import titlecase from 'to-title-case';
import mapValues from 'lodash/mapValues';

/**
 * Internal dependencies
 */
import config from 'config';
import { sectionify } from 'lib/route/path';
import { oldShowcaseUrl } from 'state/themes/utils';

export function getPreviewUrl( theme ) {
	return `${ theme.demo_uri }?demo=true&iframe=true&theme_preview=true`;
}

export function getPurchaseUrl( theme, site ) {
	return `/checkout/${ site.slug }/theme:${ theme.id }`;
}

export function getCustomizeUrl( theme, site ) {
	if ( ! site ) {
		return '/customize/';
	}

	if ( site.jetpack ) {
		return site.options.admin_url + 'customize.php?return=' +
			encodeURIComponent( window.location ) + ( theme ? '&theme=' + theme.id : '' );
	}

	return '/customize/' + site.slug + ( theme && theme.stylesheet ? '?theme=' + theme.stylesheet : '' );
}

export function getDetailsUrl( theme, site ) {
	if ( site && site.jetpack ) {
		return site.options.admin_url + 'themes.php?theme=' + theme.id;
	}

	let baseUrl = oldShowcaseUrl + theme.id;
	if ( config.isEnabled( 'manage/themes/details' ) ) {
		baseUrl = `/theme/${ theme.id }`;
	}

	return baseUrl + ( site ? `/${ site.slug }` : '' );
}

export function getSupportUrl( theme, site ) {
	if ( site && site.jetpack ) {
		return '//wordpress.org/support/theme/' + theme.id;
	}

	if ( config.isEnabled( 'manage/themes/details' ) ) {
		const sitePart = site ? `/${ site.slug }` : '';
		return `/theme/${ theme.id }/setup${ sitePart }`;
	}

	const sitePart = site ? `${ site.slug }/` : '';
	return `${ oldShowcaseUrl }${ sitePart }${ theme.id }/support`;
}

export function getHelpUrl( theme, site ) {
	if ( site && site.jetpack ) {
		return getSupportUrl( theme, site );
	}

	let baseUrl = oldShowcaseUrl + theme.id;
	if ( config.isEnabled( 'manage/themes/details' ) ) {
		baseUrl = `/theme/${ theme.id }/support`;
	}

	return baseUrl + ( site ? `/${ site.slug }` : '' );
}

export function getExternalThemesUrl( site ) {
	if ( ! site ) {
		return oldShowcaseUrl;
	}
	if ( site.jetpack ) {
		return site.options.admin_url + 'theme-install.php';
	}
	return oldShowcaseUrl + site.slug;
}

export function trackClick( componentName, eventName, verb = 'click' ) {
	const stat = `${ componentName } ${ eventName } ${ verb }`;
	analytics.ga.recordEvent( 'Themes', titlecase( stat ) );
}

export function addTracking( options ) {
	return mapValues( options, appendActionTracking );
}

function appendActionTracking( option, name ) {
	const { action } = option;

	return Object.assign( {}, option, {
		action: t => {
			action && action( t );
			trackClick( 'more button', name );
		}
	} );
}

export function getAnalyticsData( path, tier, site_id ) {
	let basePath = sectionify( path );
	let analyticsPageTitle = 'Themes';

	if ( tier ) {
		basePath += '/type/:tier';
	}

	if ( site_id ) {
		basePath += '/:site_id';
		analyticsPageTitle += ' > Single Site';
	}

	if ( tier ) {
		analyticsPageTitle += ` > Type > ${ titlecase( tier ) }`;
	}

	return { basePath, analyticsPageTitle };
}
