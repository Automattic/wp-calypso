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
import Types from './main';

export function redirect() {
	page.redirect( '/posts' );
}

export function list( context ) {
	const siteId = getSiteFragment( context.path );

	let baseAnalyticsPath = sectionify( context.path );
	if ( siteId ) {
		baseAnalyticsPath += '/:site';
	}

	pageView.record( baseAnalyticsPath, 'Custom Post Type' );

	ReactDom.render( (
		<ReduxProvider store={ context.store }>
			<Types />
		</ReduxProvider>
	), document.getElementById( 'primary' ) );
}
