/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { setBackPath } from 'calypso/state/themes/actions';
import { getProps } from './controller';
import SingleSiteComponent from './single-site';
import Upload from './theme-upload';

// Renders <SingleSiteComponent, which assumes context.params.site_id always exists
export function loggedIn( context, next ) {
	// Block direct access for P2 sites
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	if ( isSiteWPForTeams( state, siteId ) ) {
		return page.redirect( `/home/${ context.params.site_id }` );
	}

	// Scroll to the top
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = <SingleSiteComponent { ...getProps( context ) } />;

	next();
}

export function upload( context, next ) {
	// Store previous path to return to only if it was main showcase page
	if (
		context.prevPath &&
		context.prevPath.startsWith( '/themes' ) &&
		! context.prevPath.startsWith( '/themes/upload' )
	) {
		context.store.dispatch( setBackPath( context.prevPath ) );
	}

	context.primary = <Upload />;
	next();
}
