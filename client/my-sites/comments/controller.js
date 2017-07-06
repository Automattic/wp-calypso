/**
 * External dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import React from 'react';
import page from 'page';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import CommentsManagement from './main';
import config from 'config';
import route from 'lib/route';

const VALID_STATUSES = [ 'pending', 'approved', 'spam', 'trash', 'all' ];

export const isValidStatus = status => includes( VALID_STATUSES, status );

export const getRedirectUrl = ( status, siteFragment ) => {
	const statusValidity = isValidStatus( status );
	if ( status === siteFragment ) {
		return `/comments/pending/${ siteFragment }`;
	}
	if ( ! statusValidity && ! siteFragment ) {
		return '/comments/pending';
	}
	if ( ! statusValidity && siteFragment ) {
		return `/comments/pending/${ siteFragment }`;
	}
	if ( statusValidity && ! siteFragment ) {
		return `/comments/${ status }`;
	}
	return null;
};

export const redirect = function( context, next ) {
	const { status, site } = context.params;
	const siteFragment = route.getSiteFragment( context.path );
	const redirectUrl = getRedirectUrl( status, siteFragment );
	if ( redirectUrl && ( site || '/comments/' + status !== redirectUrl ) ) {
		return page.redirect( redirectUrl );
	}
	next();
};

export const comments = function( context ) {
	const { status } = context.params;
	const siteFragment = route.getSiteFragment( context.path );

	if ( ! config.isEnabled( 'comments/management/all-list' ) && 'all' === status ) {
		return page.redirect( `/comments/pending/${ siteFragment }` );
	}

	renderWithReduxStore(
		<CommentsManagement
			basePath={ context.path }
			siteFragment={ siteFragment }
			status={ 'pending' === status ? 'unapproved' : status }
		/>,
		'primary',
		context.store
	);
};
