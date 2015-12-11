/**
 * External Dependencies
 */
var page = require( 'page' ),
	ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	qs = require( 'querystring' ),
	url = require( 'url' ),
	debug = require( 'debug' )( 'calypso:my-sites:posts' );

/**
 * Internal Dependencies
 */
var user = require( 'lib/user' )(),
	sites = require( 'lib/sites-list' )(),
	route = require( 'lib/route' ),
	i18n = require( 'lib/mixins/i18n' ),
	analytics = require( 'analytics' ),
	titlecase = require( 'to-title-case' ),
	trackScrollPage = require( 'lib/track-scroll-page' ),
	titleActions = require( 'lib/screen-title/actions' );

module.exports = {

	posts: function( context ) {
		var Posts = require( 'my-sites/posts/main' ),
			siteID = route.getSiteFragment( context.path ),
			author = ( context.params.author === 'my' ) ? user.get().ID : null,
			statusSlug = ( author ) ? context.params.status : context.params.author,
			search = qs.parse( context.querystring ).s,
			basePath = route.sectionify( context.path ),
			analyticsPageTitle = 'Blog Posts',
			baseAnalyticsPath;

		if ( !search && context.prevPath ) {
			//Guessing search parameters from previous url
			search = qs.parse( url.parse( context.prevPath ).query ).s;
		}

		function shouldRedirectMyPosts( author, sites ) {
			var selectedSite = sites.getSelectedSite() || {};
			if ( ! author ) {
				return false;
			}
			if ( sites.fetched && sites.allSingleSites ) {
				return true;
			}
			if ( selectedSite.single_user_site || selectedSite.jetpack ) {
				return true;
			}
		}

		debug( 'siteID: `%s`', siteID );
		debug( 'author: `%s`', author );

		statusSlug = ( ! statusSlug || statusSlug === 'my' || statusSlug === siteID )
			? ''
			: statusSlug;
		debug( 'statusSlug: `%s`', statusSlug );

		search = ( 'undefined' !== typeof search ) ? search : '';
		debug( 'search: `%s`', search );

		if ( shouldRedirectMyPosts( author, sites ) ) {
			page.redirect( context.path.replace( /\/my\b/, '' ) );
			return;
		}

		titleActions.setTitle( i18n.translate( 'Blog Posts', { textOnly: true } ), { siteID: siteID } );

		if ( siteID ) {
			baseAnalyticsPath = basePath + '/:site';
		} else {
			baseAnalyticsPath = basePath;
		}

		if ( statusSlug.length ) {
			analyticsPageTitle += ' > ' + titlecase( statusSlug );
		} else {
			analyticsPageTitle += ' > Published';
		}

		analytics.pageView.record( baseAnalyticsPath, analyticsPageTitle );

		ReactDom.render(
			React.createElement( Posts, {
				context: context,
				siteID: siteID,
				author: author,
				statusSlug: statusSlug,
				sites: sites,
				search: search,
				trackScrollPage: trackScrollPage.bind(
					null,
					baseAnalyticsPath,
					analyticsPageTitle,
					'Posts'
				)
			} ),
			document.getElementById( 'primary' )
		);
	}
};
