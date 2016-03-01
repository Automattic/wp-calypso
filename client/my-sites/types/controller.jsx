/**
 * External Dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import page from 'page';

/**
 * Internal Dependencies
 */
import { getSiteFragment, sectionify } from 'lib/route';
import { pageView } from 'analytics';
import { setTitle } from 'lib/screen-title/actions';
import Types from './main';

export function redirect() {
	page.redirect( '/posts' );
}

export function list( context ) {
	const siteId = getSiteFragment( context.path );

	// [TODO]: Translate title text when settled upon
	setTitle( 'Custom Post Type', { siteId: siteId } );

	let baseAnalyticsPath = sectionify( context.path );
	if ( siteId ) {
		baseAnalyticsPath += '/:site';
	}

	pageView.record( baseAnalyticsPath, 'Custom Post Type' );

	ReactDom.render( <Types />, document.getElementById( 'primary' ) );
}
