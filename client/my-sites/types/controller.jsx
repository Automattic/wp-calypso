/**
 * External Dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
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
	const sectionedPath = sectionify( context.path );

	// [TODO]: Translate title text when settled upon
	setTitle( 'Custom Post Type', { siteId: siteId } );

	// Analytics
	let baseAnalyticsPath = sectionedPath;
	if ( siteId ) {
		baseAnalyticsPath += '/:site';
	}
	pageView.record( baseAnalyticsPath, 'Custom Post Type' );

	// Derive type
	const type = sectionedPath.replace( /^\/types\//, '' );

	ReactDom.render(
		<ReduxProvider store={ context.store }>
			<Types type={ type } />
		</ReduxProvider>,
		document.getElementById( 'primary' )
	);
}
