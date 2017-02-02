/**
 * External Dependencies
 */
import page from 'page';
import ReactDom from 'react-dom';
import React from 'react';
import i18n from 'i18n-calypso';
import { uniq, startsWith } from 'lodash';

/**
 * Internal Dependencies
 */
import userFactory from 'lib/user';
import sitesFactory from 'lib/sites-list';
import { receiveSite } from 'state/sites/actions';
import { getSite } from 'state/sites/selectors';
import {
	setSelectedSiteId,
	setSection,
	setAllSitesSelected
} from 'state/ui/actions';
import { savePreference } from 'state/preferences/actions';
import { hasReceivedRemotePreferences, getPreference } from 'state/preferences/selectors';
import NavigationComponent from 'my-sites/navigation';
import route from 'lib/route';
import notices from 'notices';
import config from 'config';
import analytics from 'lib/analytics';
import utils from 'lib/site/utils';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { renderWithReduxStore } from 'lib/react-helpers';
import isSelectedSiteDomainOnlySite from 'state/selectors/is-selected-site-domain-only-site';
import { domainManagementList } from 'my-sites/upgrades/paths';
import SitesComponent from 'my-sites/sites';

/**
 * Module vars
 */
const user = userFactory();
const sites = sitesFactory();
const sitesPageTitleForAnalytics = 'Sites';

/*
 * The main navigation of My Sites consists of a component with
 * the site selector list and the sidebar section items
 * @param { object } context - Middleware context
 * @returns { object } React element containing the site selector and sidebar
 */
function createNavigation( context ) {
	const siteFragment = route.getSiteFragment( context.pathname );
	let basePath = context.pathname;

	if ( siteFragment ) {
		basePath = route.sectionify( context.pathname );
	}

	return (
		<NavigationComponent path={ context.path }
			allSitesPath={ basePath }
			siteBasePath={ basePath }
			user={ user }
			sites={ sites } />
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

	renderWithReduxStore(
		React.createElement( NoSitesMessage ),
		document.getElementById( 'primary' ),
		context.store
	);
}

function renderNoVisibleSites( context ) {
	const EmptyContentComponent = require( 'components/empty-content' );
	const currentUser = user.get();
	const hiddenSites = currentUser.site_count - currentUser.visible_site_count;
	const signup_url = config( 'signup_url' );

	removeSidebar( context );

	renderWithReduxStore(
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
		document.getElementById( 'primary' ),
		context.store
	);
}

function renderSelectedSiteIsDomainOnly( { reactContext, selectedSite } ) {
	const EmptyContentComponent = require( 'components/empty-content' );
	const { store: reduxStore } = reactContext;

	removeSidebar( reactContext );

	renderWithReduxStore(
		React.createElement( EmptyContentComponent, {
			title: i18n.translate( 'This feature is not available for domains' ),
			line: i18n.translate( 'To use this feature you need to create a site' ),
			action: i18n.translate( 'Create New Site' ),
			actionURL: '//dashboard.wordpress.com/wp-admin/index.php?page=my-blogs',
			secondaryAction: i18n.translate( 'Manage Domain' ),
			secondaryActionURL: domainManagementList( selectedSite.slug )
		} ),
		document.getElementById( 'primary' ),
		reduxStore
	);
}

function isPathAllowedForDomainOnlySite( { reactContext: { pathname }, selectedSite } ) {
	const urlPrefixesWhiteListForDomainOnlySite = [
		domainManagementList( selectedSite.slug ),
		'/checkout/',
	];

	return urlPrefixesWhiteListForDomainOnlySite.some( path => startsWith( pathname, path ) );
}

function feedReduxStoreWithSelectedSite( { reactContext: { store: reduxStore }, selectedSite } ) {
	// Currently, sites are only made available in Redux state by the receive
	// here (i.e. only selected sites). If a site is already known in state,
	// avoid receiving since we risk overriding changes made more recently.
	if ( ! getSite( reduxStore.getState(), selectedSite.ID ) ) {
		reduxStore.dispatch( receiveSite( selectedSite ) );
	}
	reduxStore.dispatch( setSelectedSiteId( selectedSite.ID ) );
}

const RECENT_SITES_TO_KEEP = 3;
function setRecentSitesPreferenceInReduxStore( { reactContext: { store: reduxStore }, selectedSite } ) {
	// Update recent sites preference
	const state = reduxStore.getState();
	if ( hasReceivedRemotePreferences( state ) ) {
		const recentSites = getPreference( state, 'recentSites' );
		if ( selectedSite.ID !== recentSites[ 0 ] ) {
			reduxStore.dispatch( savePreference( 'recentSites', uniq( [
				selectedSite.ID,
				...recentSites
			] ).slice( 0, RECENT_SITES_TO_KEEP ) ) );
		}
	}
}

/**
 * Returns the site-picker react element.
 *
 * @param {object} context -- Middleware context
 * @returns {object} A site-picker React element
 */
function createSitesComponent( context ) {
	const basePath = route.sectionify( context.path );
	const path = context.prevPath ? route.sectionify( context.prevPath ) : '/stats';

	// This path sets the URL to be visited once a site is selected
	const sourcePath = ( basePath === '/sites' ) ? path : basePath;

	analytics.pageView.record( basePath, sitesPageTitleForAnalytics );

	return (
		<SitesComponent
			sites={ sites }
			path={ context.path }
			sourcePath={ sourcePath }
			user={ user }
			getSiteSelectionHeaderText={ context.getSiteSelectionHeaderText } />
	);
}

module.exports = {
	/*
	 * Set up site selection based on last URL param and/or handle no-sites error cases
	 */
	siteSelection( context, next ) {
		const siteID = route.getSiteFragment( context.path );
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
			return analytics.pageView.record( basePath, sitesPageTitleForAnalytics + ' > No Sites' );
		}

		if ( currentUser && currentUser.visible_site_count === 0 ) {
			renderNoVisibleSites( context );
			return analytics
				.pageView
				.record( basePath, `${ sitesPageTitleForAnalytics } > All Sites Hidden` );
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

		const waitForInProgressSitesFetch = () => {
			return new Promise( ( resolve, reject ) => {
				if ( ! sites.fetched && sites.fetching ) {
					sites.once( 'change', () => sites.fetched ? resolve() : reject() );
				} else {
					resolve();
				}
			} );
		};

		const hardFetchSites = () => new Promise( ( resolve, reject ) => {
			sites.initialized = false;
			sites.once( 'change', () => {
				if ( sites.fetched ) {
					sites.initialized = true;
					return resolve();
				}

				reject();
			} );

			sites.fetch();
		} );

		let waitingNotice;
		const validateAllVisibileSitesAreFetched = () => new Promise( resolve => {
			if ( currentUser.visible_site_count !== sites.getVisible().length ) {
				if ( ! waitingNotice ) {
					waitingNotice = notices.info( i18n.translate( 'Finishing set up…' ), { showDismiss: false } );
				}

				return hardFetchSites().then(
					validateAllVisibileSitesAreFetched,
					validateAllVisibileSitesAreFetched
				);
			}

			if ( waitingNotice ) {
				notices.removeNotice( waitingNotice );
			}

			resolve();
		} );

		// ensure we have fetched sites
		const sitesFetchedPromise = waitForInProgressSitesFetch().then( validateAllVisibileSitesAreFetched );

		// Select a site
		sitesFetchedPromise
			.catch( error => {
				page.redirect( allSitesPath );
				return Promise.reject( error );
			} )
			.then( () => {
				if ( ! sites.select( siteID ) ) {
					return page.redirect( allSitesPath );
				}

				const selectionContext = {
					reactContext: context,
					selectedSite: sites.getSelectedSite()
				};

				feedReduxStoreWithSelectedSite( selectionContext );

				if ( isSelectedSiteDomainOnlySite( context.store.getState() ) && ! isPathAllowedForDomainOnlySite( selectionContext ) ) {
					return renderSelectedSiteIsDomainOnly( selectionContext )
				}

				setRecentSitesPreferenceInReduxStore( selectionContext );
			} );

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
		const siteFragment = route.getSiteFragment( context.path );

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

	makeNavigation: function( context, next ) {
		context.secondary = createNavigation( context );
		next();
	},

	navigation: function( context, next ) {
		// Render the My Sites navigation in #secondary
		renderWithReduxStore(
			createNavigation( context ),
			document.getElementById( 'secondary' ),
			context.store
		);
		next();
	},

	jetPackWarning( context, next ) {
		const Main = require( 'components/main' );
		const JetpackManageErrorPage = require( 'my-sites/jetpack-manage-error-page' );
		const basePath = route.sectionify( context.path );
		const selectedSite = sites.getSelectedSite();

		if ( selectedSite && selectedSite.jetpack ) {
			renderWithReduxStore( (
				<Main>
					<JetpackManageErrorPage
						template="noDomainsOnJetpack"
						siteId={ sites.getSelectedSite().ID }
					/>
				</Main>
			), document.getElementById( 'primary' ), context.store );

			analytics.pageView.record( basePath, '> No Domains On Jetpack' );
		} else {
			next();
		}
	},

	sites( context ) {
		if ( context.query.verified === '1' ) {
			notices.success(
				i18n.translate(
					"Email verified! Now that you've confirmed your email address you can publish posts on your blog."
				)
			);
		}
		/**
		 * Sites is rendered on #primary but it doesn't expect a sidebar to exist
		 */
		removeSidebar( context );
		context.store.dispatch( setLayoutFocus( 'content' ) );

		renderWithReduxStore(
			createSitesComponent( context ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	/**
	 * Middleware that adds the site selector screen to the layout
	 * without rendering the layout. For use with isomorphic routing
	 * @see {@link https://github.com/Automattic/wp-calypso/blob/master/docs/isomorphic-routing.md }
	 *
	 * To show the site selector screen using traditional multi-tree
	 * layout, use the sites() middleware above.
	 *
	 * @param {object} context -- Middleware context
	 * @param {function} next -- Call next middleware in chain
	 */
	makeSites( context, next ) {
		context.store.dispatch( setLayoutFocus( 'content' ) );
		context.store.dispatch( setSection( {
			group: 'sites',
			secondary: false
		} ) );

		context.primary = createSitesComponent( context );
		next();
	},
};
