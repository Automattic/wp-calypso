/**
 * External Dependencies
 */
import React from 'react';
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

export function list( context, next ) {
	const siteId = getSiteFragment( context.path );
	const sectionedPath = sectionify( context.path );

	// Analytics
	let baseAnalyticsPath = sectionedPath;
	if ( siteId ) {
		baseAnalyticsPath += '/:site';
	}
	pageView.record( baseAnalyticsPath, 'Custom Post Type' );

	context.primary = (
		<Types query={ {
			type: context.params.type,
			status: context.params.status || 'publish',
			search: context.query.s
		} } />
	);

	next();
}
