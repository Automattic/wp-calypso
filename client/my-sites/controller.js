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
import isDomainOnlySite from 'state/selectors/is-domain-only-site';
import {
	domainManagementAddGoogleApps,
	domainManagementContactsPrivacy,
	domainManagementDns,
	domainManagementEdit,
	domainManagementEditContactInfo,
	domainManagementEmail,
	domainManagementEmailForwarding,
	domainManagementList,
	domainManagementNameServers,
	domainManagementPrivacyProtection,
	domainManagementRedirectSettings,
	domainManagementTransfer,
	domainManagementTransferOut,
	domainManagementTransferToAnotherUser
} from 'my-sites/upgrades/paths';
import SitesComponent from 'my-sites/sites';
import { isATEnabled } from 'lib/automated-transfer';

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

function renderSelectedSiteIsDomainOnly( reactContext, selectedSite ) {
	const DomainOnly = require( 'my-sites/upgrades/domain-management/list/domain-only' );
	const { store: reduxStore } = reactContext;

	renderWithReduxStore( (
			<DomainOnly domainName={ selectedSite.slug } siteId={ selectedSite.ID } hasNotice={ false } />
		),
		document.getElementById( 'primary' ),
		reduxStore
	);

	renderWithReduxStore(
		createNavigation( reactContext ),
		document.getElementById( 'secondary' ),
		reduxStore
	);
}

function isPathAllowedForDomainOnlySite( path, domainName ) {
	const domainManagementPaths = [
		domainManagementAddGoogleApps,
		domainManagementContactsPrivacy,
		domainManagementDns,
		domainManagementEdit,
		domainManagementEditContactInfo,
		domainManagementEmail,
		domainManagementEmailForwarding,
		domainManagementList,
		domainManagementNameServers,
		domainManagementPrivacyProtection,
		domainManagementRedirectSettings,
		domainManagementTransfer,
		domainManagementTransferOut,
		domainManagementTransferToAnotherUser
	].map( pathFactory => pathFactory( domainName, domainName ) );

	const otherPaths = [
		`/checkout/${ domainName }`
	];

	return [ ...domainManagementPaths, ...otherPaths ].indexOf( path ) > -1 ||
		startsWith( path, '/checkout/thank-you' );
}

function onSelectedSiteAvailable( context ) {
	const selectedSite = sites.getSelectedSite();
	const getState = () => context.store.getState();

	// Currently, sites are only made available in Redux state by the receive
	// here (i.e. only selected sites). If a site is already known in state,
	// avoid receiving since we risk overriding changes made more recently.
	if ( ! getSite( getState(), selectedSite.ID ) ) {
		context.store.dispatch( receiveSite( selectedSite ) );
	}

	context.store.dispatch( setSelectedSiteId( selectedSite.ID ) );

	if ( isDomainOnlySite( getState(), selectedSite.ID ) &&
		! isPathAllowedForDomainOnlySite( context.pathname, selectedSite.slug ) ) {
		renderSelectedSiteIsDomainOnly( context, selectedSite );
		return false;
	}

	// Update recent sites preference
	if ( hasReceivedRemotePreferences( getState() ) ) {
		const recentSites = getPreference( getState(), 'recentSites' );
		if ( selectedSite.ID !== recentSites[ 0 ] ) {
			context.store.dispatch( savePreference( 'recentSites', uniq( [
				selectedSite.ID,
				...recentSites
			] ).slice( 0, 3 ) ) );
		}
	}

	return true;
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

	// Clears selected site from global redux state
	noSite( context, next ) {
		context.store.dispatch( setSelectedSiteId( null ) );
		return next();
	},

	/*
	 * Set up site selection based on last URL param and/or handle no-sites error cases
	 */
	siteSelection( context, next ) {
		const siteID = context.params.site || route.getSiteFragment( context.path );
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

		// If there's a valid site from the url path
		// set site visibility to just that site on the picker
		if ( sites.select( siteID ) ) {
			const selectionComplete = onSelectedSiteAvailable( context );

			// if there was a redirect, we should terminate processing of next routes
			// and let the redirect proceed
			if ( ! selectionComplete ) {
				return;
			}
		} else {
			// if sites has fresh data and siteID is invalid
			// redirect to allSitesPath
			if ( sites.fetched || ! sites.fetching ) {
				return page.redirect( allSitesPath );
			}

			let waitingNotice;
			const selectOnSitesChange = () => {
				// if sites have loaded, but siteID is invalid, redirect to allSitesPath
				if ( sites.select( siteID ) ) {
					sites.initialized = true;
					onSelectedSiteAvailable( context );
					if ( waitingNotice ) {
						notices.removeNotice( waitingNotice );
					}
				} else if ( ( currentUser.visible_site_count !== sites.getVisible().length ) ) {
					sites.initialized = false;
					waitingNotice = notices.info( i18n.translate( 'Finishing set up…' ), { showDismiss: false } );
					sites.once( 'change', selectOnSitesChange );
					sites.fetch();
				} else {
					page.redirect( allSitesPath );
				}
			};
			// Otherwise, check when sites has loaded
			sites.once( 'change', selectOnSitesChange );
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

	jetpackModuleActive( moduleId, redirect ) {
		return function( context, next ) {
			const site = sites.getSelectedSite();

			if ( ! site.jetpack ) {
				return next();
			}

			if ( site.isModuleActive( moduleId ) || false === redirect ) {
				next();
			} else {
				page.redirect( 'string' === typeof redirect ? redirect : '/stats' );
			}
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

		if ( selectedSite && selectedSite.jetpack && ! isATEnabled( selectedSite ) ) {
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
