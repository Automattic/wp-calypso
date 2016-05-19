/**
 * External Dependencies
 */
import page from 'page';
import ReactDom from 'react-dom';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import userFactory from 'lib/user';
import sitesFactory from 'lib/sites-list';
import layoutFocus from 'lib/layout-focus';
import { receiveSite } from 'state/sites/actions';

import {
	setSelectedSiteId,
	setSection,
	setAllSitesSelected
} from 'state/ui/actions';

import NavigationComponent from 'my-sites/navigation';
import route from 'lib/route';
import notices from 'notices';
import config from 'config';
import analytics from 'lib/analytics';
import siteStatsStickyTabActions from 'lib/site-stats-sticky-tab/actions';
import utils from 'lib/site/utils';
import trackScrollPage from 'lib/track-scroll-page';

/**
 * Module vars
 */
const user = userFactory();
const sites = sitesFactory();

/*
 * The main navigation of My Sites consists of a component with
 * the site selector list and the sidebar section items
 */
function renderNavigation( context, allSitesPath, siteBasePath ) {
	// Render the My Sites navigation in #secondary
	ReactDom.render(
		React.createElement( ReduxProvider, { store: context.store },
			React.createElement( NavigationComponent, {
				layoutFocus,
				path: context.path,
				allSitesPath,
				siteBasePath,
				user,
				sites
			} )
		),
		document.getElementById( 'secondary' )
	);
}

function removeSidebar( context ) {
	context.store.dispatch( setSection( {
		group: 'sites',
		secondary: false
	} ) );
	ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
}

function renderEmptySites( context ) {
	const NoSitesMessage = require( 'components/empty-content/no-sites-message' );

	removeSidebar( context );

	ReactDom.render(
		React.createElement( NoSitesMessage ),
		document.getElementById( 'primary' )
	);
}

function renderNoVisibleSites( context ) {
	const EmptyContentComponent = require( 'components/empty-content' );
	const currentUser = user.get();
	const hiddenSites = currentUser.site_count - currentUser.visible_site_count;
	const signup_url = config( 'signup_url' );

	removeSidebar( context );

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
			secondaryActionURL: `${ signup_url }?ref=calypso-nosites`
		} ),
		document.getElementById( 'primary' )
	);
}

module.exports = {
	/*
	 * Set up site selection based on last URL param and/or handle no-sites error cases
	 */
	siteSelection( context, next ) {
		const siteID = route.getSiteFragment( context.path );
		const analyticsPageTitle = 'Sites';
		const basePath = route.sectionify( context.path );
		const currentUser = user.get();
		const hasOneSite = currentUser.visible_site_count === 1;
		const allSitesPath = route.sectionify( context.path );

		const redirectToPrimary = () => {
			let redirectPath = `${ context.pathname }/${ sites.getPrimary().slug }`;

			redirectPath = context.querystring
				? `${ redirectPath }?${ context.querystring }`
				: redirectPath;

			page.redirect( redirectPath );
		};

		if ( currentUser && currentUser.site_count === 0 ) {
			renderEmptySites( context );
			return analytics.pageView.record( basePath, analyticsPageTitle + ' > No Sites' );
		}

		if ( currentUser && currentUser.visible_site_count === 0 ) {
			renderNoVisibleSites( context );
			return analytics
				.pageView
				.record( basePath, `${ analyticsPageTitle } > All Sites Hidden` );
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
			}
			sites.once( 'change', redirectToPrimary );
		}

		// If the path fragment does not resemble a site, set all sites to visible
		if ( ! siteID ) {
			sites.selectAll();
			context.store.dispatch( setAllSitesSelected() );
			return next();
		}

		const onSelectedSiteAvailable = () => {
			const selectedSite = sites.getSelectedSite();
			siteStatsStickyTabActions.saveFilterAndSlug( false, selectedSite.slug );
			context.store.dispatch( receiveSite( selectedSite ) );
			context.store.dispatch( setSelectedSiteId( selectedSite.ID ) );
			sites.setRecentlySelectedSite( selectedSite.ID );
		};

		// If there's a valid site from the url path
		// set site visibility to just that site on the picker
		if ( sites.select( siteID ) ) {
			onSelectedSiteAvailable();
		} else {
			// if sites has fresh data and siteID is invalid
			// redirect to allSitesPath
			if ( sites.fetched || ! sites.fetching ) {
				return page.redirect( allSitesPath );
			}
			// Otherwise, check when sites has loaded
			sites.once( 'change', function() {
				// if sites have loaded, but siteID is invalid, redirect to allSitesPath
				if ( sites.select( siteID ) ) {
					onSelectedSiteAvailable();
				} else {
					page.redirect( allSitesPath );
				}
			} );
		}

		next();
	},

	awaitSiteLoaded( context, next ) {
		const siteUrl = route.getSiteFragment( context.path );

		if ( siteUrl && ! sites.initialized ) {
			sites.once( 'change', next );
		} else {
			next();
		}
	},

	jetpackModuleActive( moduleIds, redirect ) {
		return function( context, next ) {
			const site = sites.getSelectedSite();

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

	fetchJetpackSettings( context, next ) {
		var siteFragment = route.getSiteFragment( context.path );

		next();

		if ( ! siteFragment ) {
			return;
		}

		function checkSiteShouldFetch() {
			const site = sites.getSite( siteFragment );
			if ( ! site ) {
				sites.once( 'change', checkSiteShouldFetch );
			} else if ( site.jetpack && utils.userCan( 'manage_options', site ) ) {
				site.fetchSettings();
			}
		}

		checkSiteShouldFetch();
	},

	navigation( context, next ) {
		const siteFragment = route.getSiteFragment( context.pathname );
		let basePath = context.pathname;

		if ( siteFragment ) {
			basePath = route.sectionify( context.pathname );
		}

		renderNavigation( context, basePath, basePath );
		next();
	},

	jetPackWarning( context, next ) {
		const Main = require( 'components/main' );
		const JetpackManageErrorPage = require( 'my-sites/jetpack-manage-error-page' );
		const basePath = route.sectionify( context.path );
		const selectedSite = sites.getSelectedSite();

		if ( selectedSite && selectedSite.jetpack ) {
			ReactDom.render( (
				<Main>
					<JetpackManageErrorPage
						template="noDomainsOnJetpack"
						site={ sites.getSelectedSite() }
					/>
				</Main>
			), document.getElementById( 'primary' ) );

			analytics.pageView.record( basePath, '> No Domains On Jetpack' );
		} else {
			next();
		}
	},

	sites( context ) {
		const SitesComponent = require( 'my-sites/sites' );
		const analyticsPageTitle = 'Sites';
		const basePath = route.sectionify( context.path );
		const path = context.prevPath ? route.sectionify( context.prevPath ) : '/stats';

		if ( context.query.verified === '1' ) {
			notices.success( i18n.translate( "Email verified! Now that you've confirmed your email address you can publish posts on your blog." ) );
		}
		/**
		 * Sites is rendered on #primary but it doesn't expect a sidebar to exist
		 */
		removeSidebar( context );
		layoutFocus.set( 'content' );

		// This path sets the URL to be visited once a site is selected
		const sourcePath = ( basePath === '/sites' ) ? path : basePath;

		analytics.pageView.record( basePath, analyticsPageTitle );

		ReactDom.render(
			React.createElement( SitesComponent, {
				sites,
				path: context.path,
				sourcePath,
				user,
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
