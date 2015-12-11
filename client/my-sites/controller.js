/**
 * External Dependencies
 */
var page = require( 'page' ),
	ReactDom = require( 'react-dom' ),
	React = require( 'react' );

/**
 * Internal Dependencies
 */
var user = require( 'lib/user' )(),
	sites = require( 'lib/sites-list' )(),
	layoutFocus = require( 'lib/layout-focus' ),
	NavigationComponent = require( 'my-sites/navigation' ),
	route = require( 'lib/route' ),
	i18n = require( 'lib/mixins/i18n' ),
	notices = require( 'notices' ),
	config = require( 'config' ),
	analytics = require( 'analytics' ),
	siteStatsStickyTabActions = require( 'lib/site-stats-sticky-tab/actions' ),
	trackScrollPage = require( 'lib/track-scroll-page' );

/**
 * The main navigation of My Sites consists of a component with
 * the site selector list and the sidebar section items
 */
function renderNavigation( context, allSitesPath, siteBasePath ) {
	context.layout.setState( {
		section: 'sites',
		noSidebar: false
	} );

	// Render the My Sites navigation in #secondary
	ReactDom.render(
		React.createElement( NavigationComponent, {
			layoutFocus: layoutFocus,
			path: context.path,
			allSitesPath: allSitesPath,
			siteBasePath: siteBasePath,
			user: user,
			sites: sites
		} ),
		document.getElementById( 'secondary' )
	);
}

function renderEmptySites() {
	var NoSitesMessage = require( 'components/empty-content/no-sites-message' );

	ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );

	ReactDom.render(
		React.createElement( NoSitesMessage ),
		document.getElementById( 'primary' )
	);
}

function renderNoVisibleSites() {
	var EmptyContentComponent = require( 'components/empty-content' ),
		currentUser = user.get(),
		hiddenSites = currentUser.site_count - currentUser.visible_site_count;

	ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );

	ReactDom.render(
		React.createElement( EmptyContentComponent, {
			title: i18n.translate( 'You have %(hidden)d hidden WordPress site.', 'You have %(hidden)d hidden WordPress sites.', {
				count: hiddenSites,
				args: { hidden: hiddenSites }
			} ),
			line: i18n.translate( 'To manage it here, set it to visible.', 'To manage them here, set them to visible.', {
				count: hiddenSites
			} ),
			action: i18n.translate( 'Change Visibility' ),
			actionURL: '//dashboard.wordpress.com/wp-admin/index.php?page=my-blogs',
			secondaryAction: i18n.translate( 'Create New Site' ),
			secondaryActionURL: config( 'signup_url' ) + '?ref=calypso-nosites'
		} ),
		document.getElementById( 'primary' )
	);
}

module.exports = {

	/**
	 * Set up site selection based on last URL param and/or handle no-sites error cases
	 */
	siteSelection: function( context, next ) {
		var siteID = route.getSiteFragment( context.path ),
			analyticsPageTitle = 'Sites',
			basePath = route.sectionify( context.path ),
			hasOneSite = user.get().visible_site_count === 1,
			allSitesPath = route.sectionify( context.path ),
			currentUser = user.get();

		function redirectToPrimary() {
			var redirectPath = context.pathname + '/' + sites.getPrimary().slug;
			redirectPath = ( context.querystring ) ? redirectPath + '?' + context.querystring : redirectPath;
			page.redirect( redirectPath );
		}

		if ( currentUser && currentUser.site_count === 0 ) {
			renderEmptySites();
			return analytics.pageView.record( basePath, analyticsPageTitle + ' > No Sites' );
		}

		if ( currentUser && currentUser.visible_site_count === 0 ) {
			renderNoVisibleSites();
			return analytics.pageView.record( basePath, analyticsPageTitle + ' > All Sites Hidden' );
		}

		// Ignore the user account settings page
		if ( /^\/settings\/account/.test( context.path ) ) {
			return next();
		}

		// If the user has only one site, redirect to the single site
		// context instead of rendering the all-site views.
		if ( hasOneSite && ! siteID ) {
			if ( sites.initialized ) {
				redirectToPrimary();
				return;
			} else {
				sites.once( 'change', redirectToPrimary );
			}
		}

		// If the path fragment does not resemble a site, set all sites to visible
		if ( ! siteID ) {
			sites.selectAll();
			return next();
		}

		// If there's a valid site from the url path
		// set site visibility to just that site on the picker
		if ( ! sites.select( siteID ) ) {
			// if sites has fresh data and siteID is invalid
			// redirect to allSitesPath
			if ( sites.fetched || ! sites.fetching ) {
				return page.redirect( allSitesPath );
			}
			// Otherwise, check when sites has loaded
			sites.once( 'change', function() {
				// if sites have loaded, but siteID is invalid, redirect to allSitesPath
				if ( ! sites.select( siteID ) ) {
					page.redirect( allSitesPath );
				}

				siteStatsStickyTabActions.saveFilterAndSlug( false, sites.getSelectedSite().slug );
			} );
		} else {
			siteStatsStickyTabActions.saveFilterAndSlug( false, sites.getSelectedSite().slug );
		}

		next();
	},

	awaitSiteLoaded: function( context, next ) {
		var siteUrl = route.getSiteFragment( context.path );

		if ( siteUrl && ! sites.initialized ) {
			sites.once( 'change', next );
		} else {
			next();
		}
	},

	jetpackModuleActive: function( moduleIds, redirect ) {
		return function( context, next ) {
			var site = sites.getSelectedSite();

			if ( ! site.jetpack ) {
				return next();
			}

			site.verifyModulesActive( moduleIds, function( error, supported ) {
				if ( supported || false === redirect ) {
					next();
				} else {
					page.redirect( 'string' === typeof redirect ? redirect : '/stats' );
				}
			} );
		};
	},

	fetchJetpackSettings: function( context, next ) {
		var siteFragment = route.getSiteFragment( context.path );

		next();

		if ( ! siteFragment ) {
			return;
		}

		function checkSiteShouldFetch() {
			var site = sites.getSite( siteFragment );
			if ( ! site ) {
				sites.once( 'change', checkSiteShouldFetch );
			} else if ( site.jetpack ) {
				site.fetchSettings();
			}
		}

		checkSiteShouldFetch();
	},

	navigation: function( context, next ) {
		var basePath = context.pathname,
			siteFragment = route.getSiteFragment( context.pathname );

		if ( siteFragment ) {
			basePath = route.sectionify( context.pathname );
		}

		renderNavigation( context, basePath, basePath );
		next();
	},

	removeOverlay: function( context, next ) {
		ReactDom.unmountComponentAtNode( document.getElementById( 'tertiary' ) );
		next();
	},

	jetPackWarning: function( context, next ) {
		var Main = require( 'components/main' ),
			JetpackManageErrorPage = require( 'my-sites/jetpack-manage-error-page' ),
			basePath = route.sectionify( context.path ),
			selectedSite = sites.getSelectedSite();

		if ( selectedSite && selectedSite.jetpack ) {
			ReactDom.render( (
				<Main>
					<JetpackManageErrorPage template="noDomainsOnJetpack" site={ sites.getSelectedSite() }/>
				</Main>
			), document.getElementById( 'primary' ) );

			analytics.pageView.record( basePath, '> No Domains On Jetpack' );
		} else {
			next();
		}
	},

	sites: function( context ) {
		var SitesComponent = require( 'my-sites/sites' ),
			analyticsPageTitle = 'Sites',
			basePath = route.sectionify( context.path ),
			path = context.prevPath ? route.sectionify( context.prevPath ) : '/stats',
			sourcePath;

		if ( context.query.verified === '1' ) {
			notices.success( i18n.translate( "Email verified! Now that you've confirmed your email address you can publish posts on your blog." ) );
		}

		/**
		 * Sites is rendered on #primary but it doesn't expect a sidebar to exist
		 * so section needs to be set explicitly and #secondary cleaned up
		 */
		context.layout.setState( {
			section: 'sites',
			noSidebar: true
		} );
		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
		layoutFocus.set( 'content' );

		// This path sets the URL to be visited once a site is selected
		sourcePath = ( basePath === '/sites' ) ? path : basePath;

		analytics.pageView.record( basePath, analyticsPageTitle );

		ReactDom.render(
			React.createElement( SitesComponent, {
				sites: sites,
				path: context.path,
				sourcePath: sourcePath,
				user: user,
				getSiteSelectionHeaderText: context.getSiteSelectionHeaderText,
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					analyticsPageTitle,
					'Sites'
				)
			} ),
			document.getElementById( 'primary' )
		);
	}

};
