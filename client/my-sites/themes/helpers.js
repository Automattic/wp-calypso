/** @ssr-ready **/

/**
 * External dependencies
 */
import analytics from 'analytics';
import titlecase from 'to-title-case';
import page from 'page';
import startsWith from 'lodash/startsWith';
import assign from 'lodash/assign';
import mapValues from 'lodash/mapValues';

/**
 * Internal dependencies
 */
import config from 'config';
import	route from 'lib/route';

var ThemesHelpers = {
	oldShowcaseUrl: '//wordpress.com/themes/',

	getSignupUrl( theme ) {
		let url = '/start/with-theme?ref=calypshowcase&theme=' + theme.id;

		if ( this.isPremium( theme ) ) {
			url += '&premium=true';
		}

		return url;
	},

	getPreviewUrl( theme, site ) {
		if ( site && site.jetpack ) {
			return site.options.admin_url + 'customize.php?theme=' + theme.id + '&return=' + encodeURIComponent( window.location );
		}

		return `${theme.demo_uri}?demo=true&iframe=true&theme_preview=true`;
	},

	getCustomizeUrl: function( theme, site ) {
		if ( ! site ) {
			return '/customize/';
		}

		if ( site.jetpack ) {
			return site.options.admin_url + 'customize.php?return=' + encodeURIComponent( window.location ) + ( theme ? '&theme=' + theme.id : '' );
		}

		return '/customize/' + site.slug + '?nomuse=1' + ( theme ? '&theme=' + theme.stylesheet : '' );
	},

	getDetailsUrl: function( theme, site ) {
		const baseUrl = config.isEnabled( 'manage/themes/details' ) ? '/themes/' : ThemesHelpers.oldShowcaseUrl;

		if ( ! site ) {
			return baseUrl + theme.id;
		}

		if ( site.jetpack ) {
			return site.options.admin_url + 'themes.php?theme=' + theme.id;
		}

		return baseUrl + `${ theme.id }/${ site.slug }`;
	},

	getSupportUrl: function( theme, site ) {
		if ( ! site ) {
			return ThemesHelpers.oldShowcaseUrl + theme.id + '/support';
		}

		if ( site.jetpack ) {
			return '//wordpress.org/support/theme/' + theme.id;
		}

		return ThemesHelpers.oldShowcaseUrl + site.slug + '/' + theme.id + '/support';
	},

	getForumUrl: function( theme ) {
		return this.isPremium( theme ) ? '//premium-themes.forums.wordpress.com/forum/' + theme.id : '//en.forums.wordpress.com/forum/themes';
	},

	getExternalThemesUrl: function( site ) {
		if ( ! site ) {
			return ThemesHelpers.oldShowcaseUrl;
		}
		if ( site.jetpack ) {
			return site.options.admin_url + 'theme-install.php';
		}
		return ThemesHelpers.oldShowcaseUrl + site.slug;
	},

	isPremium: function( theme ) {
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
	},

	trackClick: function( componentName, eventName, verb = 'click' ) {
		const stat = `${componentName} ${eventName} ${verb}`;
		analytics.ga.recordEvent( 'Themes', titlecase( stat ) );
	},

	addTracking: function( options ) {
		return mapValues( options, this.appendActionTracking );
	},

	appendActionTracking: function( option, name ) {
		const { action } = option;

		if ( ! action ) {
			return option;
		}

		return assign( {}, option, {
			action: t => {
				action( t );
				ThemesHelpers.trackClick( 'more button', name );
			}
		} );
	},

	navigateTo: function( url, external ) {
		if ( external ) {
			window.open( url );
		} else {
			page( url );
		}
	},

	getAnalyticsData: function( path, tier, site_id ) {
		let basePath = route.sectionify( path );
		let analyticsPageTitle = 'Themes';

		if ( site_id ) {
			basePath = basePath + '/:site_id';
			analyticsPageTitle += ' > Single Site';
		}

		if ( tier ) {
			analyticsPageTitle += ` > Type > ${titlecase( tier )}`;
		}

		return { basePath, analyticsPageTitle };
	},
};

module.exports = ThemesHelpers;
