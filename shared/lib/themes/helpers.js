/**
 * External dependencies
 */
var analytics = require( 'analytics' ),
	titlecase = require( 'to-title-case' ),
	page = require( 'page' ),
	startsWith = require( 'lodash/string/startsWith' );

var ThemesHelpers = {
	oldShowcaseUrl: '//wordpress.com/themes/',

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
		if ( ! site ) {
			return ThemesHelpers.oldShowcaseUrl + theme.id;
		}

		if ( site.jetpack ) {
			return site.options.admin_url + 'themes.php?theme=' + theme.id;
		}

		return ThemesHelpers.oldShowcaseUrl + site.slug + '/' + theme.id;
	},

	getSupportUrl: function( theme, site ) {
		if ( site && site.jetpack ) {
			return '//wordpress.org/support/theme/' + theme.id;
		}

		return ThemesHelpers.oldShowcaseUrl + theme.id + '/support';
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
		return startsWith( theme.stylesheet, 'premium/' );
	},

	getSlugFromName: function( name ) {
		var theme = name.replace( /\s+/g, '' );
		return theme.toLowerCase();
	},

	trackClick: function( componentName, eventName, verb = 'click' ) {
		const stat = `${componentName} ${eventName} ${verb}`;
		analytics.ga.recordEvent( 'Themes', titlecase( stat ) );
	},

	navigateTo: function( url, external ) {
		if ( external ) {
			window.open( url );
		} else {
			page( url );
		}
	}
};

module.exports = ThemesHelpers;
