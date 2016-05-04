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
import { pageView } from 'lib/analytics';
import Types from './main';

export function redirect() {
	page.redirect( '/posts' );
}

export function list( context ) {
	const siteId = getSiteFragment( context.path );
	const sectionedPath = sectionify( context.path );

	// Analytics
	let baseAnalyticsPath = sectionedPath;
	if ( siteId ) {
		baseAnalyticsPath += '/:site';
	}
	pageView.record( baseAnalyticsPath, 'Custom Post Type' );

	// Construct query arguments
	const query = {
		type: context.params.type,
		status: context.params.status || 'publish',
		search: context.query.s
	};

	ReactDom.render(
		<ReduxProvider store={ context.store }>
			<Types query={ query } />
		</ReduxProvider>,
		document.getElementById( 'primary' )
	);
}
