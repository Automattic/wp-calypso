/**
 * External Dependencies
 */
import page from 'page';
import qs from 'qs';
import i18n from 'i18n-calypso';
import React from 'react';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import route from 'lib/route';
import Main from 'components/main';
import upgradesActions from 'lib/upgrades/actions';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import productsFactory from 'lib/products-list';
import { renderWithReduxStore } from 'lib/react-helpers';
import { canCurrentUser } from 'state/selectors';
import {
	getSelectedSiteId,
	getSelectedSite,
	getSelectedSiteSlug
} from 'state/ui/selectors';
import { getCurrentUser } from 'state/current-user/selectors';

/**
 * Module variables
 */
const productsList = productsFactory();

module.exports = {

	domainsAddHeader: function( context, next ) {
		context.getSiteSelectionHeaderText = function() {
			return i18n.translate( 'Select a site to add a domain' );
		};

		next();
	},

	domainsAddRedirectHeader: function( context, next ) {
		context.getSiteSelectionHeaderText = function() {
			return i18n.translate( 'Select a site to add Site Redirect' );
		};

		next();
	},

	domainSearch: function( context ) {
		var CartData = require( 'components/data/cart' ),
			DomainSearch = require( './domain-search' ),
			basePath = route.sectionify( context.path );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Domain Search' ) ) );

		analytics.pageView.record( basePath, 'Domain Search > Domain Registration' );

		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}

		renderWithReduxStore(
			(
				<CartData>
					<DomainSearch
						basePath={ basePath }
						context={ context } />
				</CartData>
			),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	siteRedirect: function( context ) {
		var CartData = require( 'components/data/cart' ),
			SiteRedirect = require( './domain-search/site-redirect' ),
			basePath = route.sectionify( context.path );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Redirect a Site' ) ) );

		analytics.pageView.record( basePath, 'Domain Search > Site Redirect' );

		renderWithReduxStore(
			(
				<CartData>
					<SiteRedirect />
				</CartData>
			),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	mapDomain: function( context ) {
		var CartData = require( 'components/data/cart' ),
			MapDomain = require( 'my-sites/domains/map-domain' ).default,
			basePath = route.sectionify( context.path );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Map a Domain' ) ) );

		analytics.pageView.record( basePath, 'Domain Search > Domain Mapping' );
		renderWithReduxStore(
			(
				<Main>
					<CartData>
						<MapDomain
							initialQuery={ context.query.initialQuery } />
					</CartData>
				</Main>
			),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	googleAppsWithRegistration: function( context ) {
		var CartData = require( 'components/data/cart' ),
			GoogleApps = require( 'components/upgrades/google-apps' );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle(
			i18n.translate( 'Register %(domain)s', {
				args: { domain: context.params.registerDomain }
			} )
		) );

		const state = context.store.getState();
		const siteSlug = getSelectedSiteSlug( state ) || '';

		const handleAddGoogleApps = function( googleAppsCartItem ) {
			upgradesActions.addItem( googleAppsCartItem );
			page( '/checkout/' + siteSlug );
		};

		const handleGoBack = function() {
			page( '/domains/add/' + siteSlug );
		};

		const handleClickSkip = function() {
			page( '/checkout/' + siteSlug );
		};

		analytics.pageView.record( '/domains/add/:site/google-apps', 'Domain Search > Domain Registration > Google Apps' );

		renderWithReduxStore(
			(
				<Main>
					<CartData>
						<GoogleApps
							productsList={ productsList }
							domain={ context.params.registerDomain }
							onGoBack={ handleGoBack }
							onAddGoogleApps={ handleAddGoogleApps }
							onClickSkip={ handleClickSkip } />
					</CartData>
				</Main>
			),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	redirectIfNoSite: function( redirectTo ) {
		return function( context, next ) {
			const state = context.store.getState();
			const siteId = getSelectedSiteId( state );
			const userCanManageOptions = canCurrentUser( state, siteId, 'manage_options' );
			if ( ! userCanManageOptions ) {
				const user = getCurrentUser( state );
				const visibleSiteCount = get( user, 'visible_site_count', 0 );
				//if only one site navigate to stats to avoid redirect loop
				const redirect = visibleSiteCount > 1 ? redirectTo : '/stats';
				return page.redirect( redirect );
			}
			next();
		};
	},

	redirectToAddMappingIfVipSite: function() {
		return function( context, next ) {
			const state = context.store.getState();
			const selectedSite = getSelectedSite( state ),
				domain = context.params.domain ? `/${ context.params.domain }` : '',
				query = qs.stringify( { initialQuery: context.params.suggestion } );

			if ( selectedSite && selectedSite.is_vip ) {
				return page.redirect( `/domains/add/mapping${ domain }?${ query }` );
			}

			next();
		};
	}
};
