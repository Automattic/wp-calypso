/** @format */
/**
 * External dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import React from 'react';
import page from 'page';
import { each, includes, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import CommentsManagement from './main';
import route from 'lib/route';
import { removeNotice } from 'state/notices/actions';
import { getNotices } from 'state/notices/selectors';

const VALID_STATUSES = [ 'all', 'pending', 'approved', 'spam', 'trash' ];

export const isValidStatus = status => includes( VALID_STATUSES, status );

export const setValidPage = pageNumber => ( parseInt( pageNumber, 10 ) > 0 ? pageNumber : 1 );

export const getRedirectUrl = ( status, siteFragment ) => {
	const statusValidity = isValidStatus( status );
	if ( status === siteFragment ) {
		return `/comments/all/${ siteFragment }`;
	}
	if ( ! statusValidity && ! siteFragment ) {
		return '/comments/all';
	}
	if ( ! statusValidity && siteFragment ) {
		return `/comments/all/${ siteFragment }`;
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
	const validPage = setValidPage( context.query.page );

	renderWithReduxStore(
		<CommentsManagement
			basePath={ context.path }
			page={ validPage }
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
