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
import route from 'lib/route';
import CommentsManagement from './main';

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
	const { status } = context.params;
	const siteFragment = route.getSiteFragment( context.path );
	const redirectUrl = getRedirectUrl( status, siteFragment );
	if ( redirectUrl && '/comments/' + status !== redirectUrl ) {
		return page.redirect( redirectUrl );
	}
	next();
};

export const comments = function( context ) {
	const { status } = context.params;
	const siteFragment = route.getSiteFragment( context.path );
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
