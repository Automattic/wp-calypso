/**
 * External dependencies
 */
import { each, includes, startsWith } from 'lodash';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import CommentsManagement from './main';
import config from 'config';
import { renderWithReduxStore } from 'lib/react-helpers';
import route from 'lib/route';
import { removeNotice } from 'state/notices/actions';
import { getNotices } from 'state/notices/selectors';

const VALID_STATUSES = [ 'pending', 'approved', 'spam', 'trash' ];
if ( config.isEnabled( 'comments/management/all-list' ) ) {
	VALID_STATUSES.push( 'all' );
}

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

export const clearCommentNotices = ( { store }, next ) => {
	const nextPath = page.current;
	if ( ! startsWith( nextPath, '/comments' ) ) {
		const { getState, dispatch } = store;
		const notices = getNotices( getState() );
		each( notices, ( { noticeId } ) => {
			if ( startsWith( noticeId, 'comment-notice' ) ) {
				dispatch( removeNotice( noticeId ) );
			}
		} );
	}
	next();
};
