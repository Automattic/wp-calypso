/** @ssr-ready **/

/**
 * External dependencies
 */
import analytics from 'lib/analytics';
import titlecase from 'to-title-case';
import startsWith from 'lodash/startsWith';
import mapValues from 'lodash/mapValues';

/**
 * Internal dependencies
 */
import config from 'config';
import route from 'lib/route';

const oldShowcaseUrl = '//wordpress.com/themes/';

export function getSignupUrl( theme ) {
	let url = '/start/with-theme?ref=calypshowcase&theme=' + theme.id;

	if ( isPremium( theme ) ) {
		url += '&premium=true';
	}

	return url;
}

export function getPreviewUrl( theme, site ) {
	if ( site && site.jetpack ) {
		return site.options.admin_url + 'customize.php?theme=' + theme.id + '&return=' + encodeURIComponent( window.location );
	}

	return `${theme.demo_uri}?demo=true&iframe=true&theme_preview=true`;
}

export function getCustomizeUrl( theme, site ) {
	if ( ! site ) {
		return '/customize/';
	}

	if ( site.jetpack ) {
		return site.options.admin_url + 'customize.php?return=' + encodeURIComponent( window.location ) + ( theme ? '&theme=' + theme.id : '' );
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

export function getForumUrl( theme ) {
	return isPremium( theme ) ? '//premium-themes.forums.wordpress.com/forum/' + theme.id : '//en.forums.wordpress.com/forum/themes';
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

export function isPremium( theme ) {
	if ( ! theme ) {
		return false;
	}

	if ( theme.stylesheet && startsWith( theme.stylesheet, 'premium/' ) ) {
		return true;
	}
	// The /v1.1/sites/:site_id/themes/mine endpoint (which is used by the
	// current-theme reducer, selector, and component) does not return a
	// `stylesheet` attribute. However, it does return a `cost` field (which
	// contains the correct price even if the user has already purchased that
	// theme, or if they have an upgrade that includes all premium themes).
	return !! ( theme.cost && theme.cost.number );
}

export function trackClick( componentName, eventName, verb = 'click' ) {
	const stat = `${componentName} ${eventName} ${verb}`;
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
	let basePath = route.sectionify( path );
	let analyticsPageTitle = 'Themes';

	if ( tier ) {
		basePath += '/type/:tier';
	}

	if ( site_id ) {
		basePath += '/:site_id';
		analyticsPageTitle += ' > Single Site';
	}

	if ( tier ) {
		analyticsPageTitle += ` > Type > ${titlecase( tier )}`;
	}

	return { basePath, analyticsPageTitle };
}
