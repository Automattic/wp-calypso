/**
 * External Dependencies
 */
import page from 'page';
import ReactDom from 'react-dom';
import React from 'react';
import i18n from 'i18n-calypso';
import { uniq, some, startsWith } from 'lodash';

/**
 * Internal Dependencies
 */
import { SITES_ONCE_CHANGED } from 'state/action-types';
import userFactory from 'lib/user';
import { receiveSite, requestSites } from 'state/sites/actions';
import {
	getSite,
	isJetpackModuleActive,
	isJetpackSite,
	isRequestingSites,
} from 'state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
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
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { renderWithReduxStore } from 'lib/react-helpers';
import {
	getPrimarySiteId,
	getSiteId,
	getSites,
	getVisibleSites,
	isDomainOnlySite,
} from 'state/selectors';
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
	domainManagementTransferToOtherSite,
} from 'my-sites/domains/paths';
import SitesComponent from 'my-sites/sites';
import { isATEnabled } from 'lib/automated-transfer';
import { errorNotice } from 'state/notices/actions';
import { getPrimaryDomainBySiteId } from 'state/selectors';

import NoSitesMessage from 'components/empty-content/no-sites-message';
import EmptyContentComponent from 'components/empty-content';
import DomainOnly from 'my-sites/domains/domain-management/list/domain-only';
import Main from 'components/main';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';

/*
 * @FIXME Shorthand, but I might get rid of this.
 */
const getStore = ( context ) => ( {
	getState: () => context.store.getState(),
	dispatch: ( action ) => context.store.dispatch( action ),
} );

/**
 * Module vars
 */
const user = userFactory();
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
			user={ user } />
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
	removeSidebar( context );

	renderWithReduxStore(
		React.createElement( NoSitesMessage ),
		document.getElementById( 'primary' ),
		context.store
	);
}

function renderNoVisibleSites( context ) {
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
	const { store: reduxStore } = reactContext;

	renderWithReduxStore( (
			<DomainOnly siteId={ selectedSite.ID } hasNotice={ false } />
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

function isPathAllowedForDomainOnlySite( path, slug, primaryDomain ) {
	const allPaths = [
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
		domainManagementTransferToOtherSite
	];

	let domainManagementPaths = allPaths.map( pathFactory => pathFactory( slug, slug ) );

	if ( primaryDomain && slug !== primaryDomain.name ) {
		domainManagementPaths = domainManagementPaths.concat(
			allPaths.map( pathFactory => pathFactory( slug, primaryDomain.name ) )
		);
	}

	const otherPaths = [
		`/checkout/${ slug }`
	];
	const startsWithPaths = [
		'/checkout/thank-you',
		`/me/purchases/${ slug }`
	];

	if ( some( startsWithPaths, startsWithPath => startsWith( path, startsWithPath ) ) ) {
		return true;
	}

	return [ ...domainManagementPaths, ...otherPaths ].indexOf( path ) > -1;
}

function onSelectedSiteAvailable( context ) {
	const { getState } = getStore( context );
	const selectedSite = getSelectedSite( getState() );

	// Currently, sites are only made available in Redux state by the receive
	// here (i.e. only selected sites). If a site is already known in state,
	// avoid receiving since we risk overriding changes made more recently.
	if ( ! getSite( getState(), selectedSite.ID ) ) {
		context.store.dispatch( receiveSite( selectedSite ) );
	}

	context.store.dispatch( setSelectedSiteId( selectedSite.ID ) );

	const primaryDomain = getPrimaryDomainBySiteId( getState(), selectedSite.ID );

	if ( isDomainOnlySite( getState(), selectedSite.ID ) &&
		! isPathAllowedForDomainOnlySite( context.pathname, selectedSite.slug, primaryDomain ) ) {
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
			] ).slice( 0, 5 ) ) );
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
			path={ context.path }
			sourcePath={ sourcePath }
			user={ user }
			getSiteSelectionHeaderText={ context.getSiteSelectionHeaderText } />
	);
}

export default {

	// Clears selected site from global redux state
	noSite( context, next ) {
		context.store.dispatch( setSelectedSiteId( null ) );
		return next();
	},

	/*
	 * Set up site selection based on last URL param and/or handle no-sites error cases
	 */
	siteSelection( context, next ) {
		const { getState, dispatch } = getStore( context );
		const siteFragment = context.params.site || route.getSiteFragment( context.path );
		const basePath = route.sectionify( context.path, siteFragment );
		const currentUser = user.get();
		const hasOneSite = currentUser.visible_site_count === 1;
		const allSitesPath = route.sectionify( context.path, siteFragment );
		const primaryId = getPrimarySiteId( getState() );
		const primary = getSite( getState(), primaryId ) || '';

		const redirectToPrimary = () => {
			let redirectPath = `${ context.pathname }/${ primary.slug }`;

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
		if ( hasOneSite && ! siteFragment ) {
			if ( primary ) {
				const hasInitialized = getSites( getState() ).length;
				if ( hasInitialized ) {
					redirectToPrimary();
					return;
				}
				dispatch( {
					type: SITES_ONCE_CHANGED,
					listener: redirectToPrimary,
				} );
			} else {
				// If the primary site does not exist, skip redirect and display a useful error notification
				dispatch( errorNotice( i18n.translate( 'Please set your Primary Site to valid site' ), {
					button: 'Settings',
					href: '/me/account',
				} ) );
			}
		}

		// If the path fragment does not resemble a site, set all sites to visible
		if ( ! siteFragment ) {
			dispatch( setAllSitesSelected() );
			return next();
		}

		const siteId = getSiteId( getState(), siteFragment );
		if ( siteId ) {
			dispatch( setSelectedSiteId( siteId ) );
			const selectionComplete = onSelectedSiteAvailable( context );

			// if there was a redirect, we should terminate processing of next routes
			// and let the redirect proceed
			if ( ! selectionComplete ) {
				return;
			}
		} else {
			// if sites has fresh data and siteId is invalid
			// redirect to allSitesPath
			if ( ! isRequestingSites( getState() ) ) {
				return page.redirect( allSitesPath );
			}

			let waitingNotice;
			let freshSiteId;
			const selectOnSitesChange = () => {
				// if sites have loaded, but siteId is invalid, redirect to allSitesPath
				freshSiteId = getSiteId( getState(), siteFragment );
				dispatch( setSelectedSiteId( freshSiteId ) );
				if ( getSite( getState(), freshSiteId ) ) {
					onSelectedSiteAvailable( context );
					if ( waitingNotice ) {
						notices.removeNotice( waitingNotice );
					}
				} else if ( ( currentUser.visible_site_count !== getVisibleSites( getState() ).length ) ) {
					waitingNotice = notices.info( i18n.translate( 'Finishing set up…' ), { showDismiss: false } );
					dispatch( {
						type: SITES_ONCE_CHANGED,
						listener: selectOnSitesChange,
					} );
					dispatch( requestSites() );
				} else {
					page.redirect( allSitesPath );
				}
			};
			// Otherwise, check when sites has loaded
			dispatch( {
				type: SITES_ONCE_CHANGED,
				listener: selectOnSitesChange,
			} );
		}
		next();
	},

	jetpackModuleActive( moduleId, redirect ) {
		return function( context, next ) {
			const { getState } = getStore( context );
			const siteId = getSelectedSiteId( getState() );
			const isJetpack = isJetpackSite( getState(), siteId );
			const isModuleActive = isJetpackModuleActive(
					getState(),
					siteId,
					moduleId );

			if ( ! isJetpack ) {
				return next();
			}

			if ( isModuleActive || false === redirect ) {
				next();
			} else {
				page.redirect( 'string' === typeof redirect ? redirect : '/stats' );
			}
		};
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
	    const { getState } = getStore( context );
		const basePath = route.sectionify( context.path );
		const selectedSite = getSelectedSite( getState() );

		if ( selectedSite && selectedSite.jetpack && ! isATEnabled( selectedSite ) ) {
			renderWithReduxStore( (
				<Main>
					<JetpackManageErrorPage
						template="noDomainsOnJetpack"
						siteId={ selectedSite.ID }
					/>
				</Main>
			), document.getElementById( 'primary' ), context.store );

			analytics.pageView.record( basePath, '> No Domains On Jetpack' );
		} else {
			next();
		}
	},

	sites( context ) {
		const { dispatch } = getStore( context );
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
		dispatch( setLayoutFocus( 'content' ) );

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
