/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { setDocumentHeadTitle as setTitle } from 'calypso/state/document-head/actions';
import SidebarComponent from 'calypso/me/sidebar';
import AppsComponent from 'calypso/me/get-apps';
import { requestSite } from 'calypso/state/sites/actions';
import getSiteId from 'calypso/state/selectors/get-site-id';
import { setSelectedSiteId } from 'calypso/state/ui/actions';

export function sidebar( context, next ) {
	context.secondary = React.createElement( SidebarComponent, {
		context: context,
	} );

	next();
}

export function profile( context, next ) {
	// FIXME: Auto-converted from the setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'My Profile', { textOnly: true } ) ) );

	const ProfileComponent = require( 'calypso/me/profile' ).default;

	context.primary = React.createElement( ProfileComponent, {
		path: context.path,
	} );
	next();
}

export function apps( context, next ) {
	// FIXME: Auto-converted from the setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Get Apps', { textOnly: true } ) ) );

	context.primary = React.createElement( AppsComponent, {
		path: context.path,
	} );
	next();
}

export function profileRedirect() {
	page.redirect( '/me' );
}

const getStore = ( context ) => ( {
	getState: () => context.store.getState(),
	dispatch: ( action ) => context.store.dispatch( action ),
} );

/*
 * Look for a query parameter like ?site=mysite.wordpress.com and set the
 * selected site. This is a scaled down version of siteSelection() from
 * calypso/my-sites/controller, but it
 * - only looks in the query string
 * - does not redirect based on error conditions, it just declines to set the site
 * Designed for /me/account.
 */
export function siteSelectionQuery( context, next ) {
	// Guard: Do nothing if no site is provided
	const siteFragment = context?.query?.site;
	if ( ! siteFragment ) {
		return next();
	}

	// If site already exists in state, select it and continue
	const { getState, dispatch } = getStore( context );
	const siteId = getSiteId( getState(), siteFragment );
	if ( siteId ) {
		dispatch( setSelectedSiteId( siteId ) );
		return next();
	}

	// Site isn't in state yet, fetch the site by siteFragment and then try to
	// select again
	dispatch( requestSite( siteFragment ) ).then( () => {
		let freshSiteId = getSiteId( getState(), siteFragment );

		if ( ! freshSiteId ) {
			const wpcomStagingFragment = siteFragment.replace( /\b.wordpress.com/, '.wpcomstaging.com' );
			freshSiteId = getSiteId( getState(), wpcomStagingFragment );
		}

		if ( freshSiteId ) {
			dispatch( setSelectedSiteId( freshSiteId ) );
		}
	} );
	return next();
}
