/** @format */
/**
 * External dependencies
 */
import page from 'page';
import qs from 'qs';
import { translate } from 'i18n-calypso';
import React from 'react';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import DocumentHead from 'components/data/document-head';
import { sectionify } from 'lib/route';
import Main from 'components/main';
import { addItem } from 'lib/upgrades/actions';
import productsFactory from 'lib/products-list';
import { canCurrentUser } from 'state/selectors';
import { getSelectedSiteId, getSelectedSite, getSelectedSiteSlug } from 'state/ui/selectors';
import { getCurrentUser } from 'state/current-user/selectors';

/**
 * Module variables
 */
const productsList = productsFactory();

const domainsAddHeader = ( context, next ) => {
	context.getSiteSelectionHeaderText = () => {
		return translate( 'Select a site to add a domain' );
	};

	next();
};

const domainsAddRedirectHeader = ( context, next ) => {
	context.getSiteSelectionHeaderText = () => {
		return translate( 'Select a site to add Site Redirect' );
	};

	next();
};

const domainSearch = ( context, next ) => {
	const CartData = require( 'components/data/cart' );
	const DomainSearch = require( './domain-search' );
	const basePath = sectionify( context.path );

	analytics.pageView.record( basePath, 'Domain Search > Domain Registration' );

	// Scroll to the top
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = (
		<Main>
			<DocumentHead title={ translate( 'Domain Search' ) } />
			<CartData>
				<DomainSearch basePath={ basePath } context={ context } />
			</CartData>
		</Main>
	);
	next();
};

const siteRedirect = ( context, next ) => {
	const CartData = require( 'components/data/cart' );
	const SiteRedirect = require( './domain-search/site-redirect' );
	const basePath = sectionify( context.path );

	analytics.pageView.record( basePath, 'Domain Search > Site Redirect' );

	context.primary = (
		<Main>
			<DocumentHead title={ translate( 'Redirect a Site' ) } />
			<CartData>
				<SiteRedirect />
			</CartData>
		</Main>
	);
	next();
};

const mapDomain = ( context, next ) => {
	const CartData = require( 'components/data/cart' );
	const MapDomain = require( 'my-sites/domains/map-domain' ).default;
	const basePath = sectionify( context.path );

	analytics.pageView.record( basePath, 'Domain Search > Domain Mapping' );
	context.primary = (
		<Main>
			<DocumentHead title={ translate( 'Map a Domain' ) } />

			<CartData>
				<MapDomain initialQuery={ context.query.initialQuery } />
			</CartData>
		</Main>
	);
	next();
};

const transferDomain = ( context, next ) => {
	const CartData = require( 'components/data/cart' );
	const TransferDomain = require( 'my-sites/domains/transfer-domain' ).default;
	const basePath = sectionify( context.path );

	analytics.pageView.record( basePath, 'Domain Search > Domain Transfer' );
	context.primary = (
		<Main>
			<DocumentHead title={ translate( 'Transfer a Domain' ) } />
			<CartData>
				<TransferDomain basePath={ basePath } initialQuery={ context.query.initialQuery } />
			</CartData>
		</Main>
	);
	next();
};

const googleAppsWithRegistration = ( context, next ) => {
	const CartData = require( 'components/data/cart' );
	const GoogleApps = require( 'components/upgrades/google-apps' );

	const state = context.store.getState();
	const siteSlug = getSelectedSiteSlug( state ) || '';

	const handleAddGoogleApps = googleAppsCartItem => {
		addItem( googleAppsCartItem );
		page( '/checkout/' + siteSlug );
	};

	const handleGoBack = () => {
		page( '/domains/add/' + siteSlug );
	};

	const handleClickSkip = () => {
		page( '/checkout/' + siteSlug );
	};

	analytics.pageView.record(
		'/domains/add/:site/google-apps',
		'Domain Search > Domain Registration > Google Apps'
	);

	context.primary = (
		<Main>
			<DocumentHead
				title={ translate( 'Register %(domain)s', {
					args: { domain: context.params.registerDomain },
				} ) }
			/>
			<CartData>
				<GoogleApps
					productsList={ productsList }
					domain={ context.params.registerDomain }
					onGoBack={ handleGoBack }
					onAddGoogleApps={ handleAddGoogleApps }
					onClickSkip={ handleClickSkip }
				/>
			</CartData>
		</Main>
	);
	next();
};

const redirectIfNoSite = redirectTo => {
	return ( context, next ) => {
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
};

const redirectToAddMappingIfVipSite = () => {
	return ( context, next ) => {
		const state = context.store.getState();
		const selectedSite = getSelectedSite( state );
		const domain = context.params.domain ? `/${ context.params.domain }` : '';
		const query = qs.stringify( { initialQuery: context.params.suggestion } );

		if ( selectedSite && selectedSite.is_vip ) {
			return page.redirect( `/domains/add/mapping${ domain }?${ query }` );
		}

		next();
	};
};

export default {
	domainsAddHeader,
	domainsAddRedirectHeader,
	domainSearch,
	siteRedirect,
	mapDomain,
	googleAppsWithRegistration,
	redirectIfNoSite,
	redirectToAddMappingIfVipSite,
	transferDomain,
};
