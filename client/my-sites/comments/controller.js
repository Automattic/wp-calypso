/** @format */
/**
 * External dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import React from 'react';
import page from 'page';
import { each, isFinite, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import CommentsManagement from './main';
import route, { addQueryArgs } from 'lib/route';
import { removeNotice } from 'state/notices/actions';
import { getNotices } from 'state/notices/selectors';

const mapPendingStatusToUnapproved = status => ( 'pending' === status ? 'unapproved' : status );

const changePage = path => pageNumber => {
	if ( window ) {
		window.scrollTo( 0, 0 );
	}
	return page( addQueryArgs( { page: pageNumber }, path ) );
};

export const siteComments = ( { params, path, query, store } ) => {
	const siteFragment = route.getSiteFragment( path );

	if ( ! siteFragment ) {
		return page.redirect( '/comments/all' );
	}

	const status = mapPendingStatusToUnapproved( params.status );

	const pageNumber = parseInt( query.page, 10 );
	if ( isNaN( pageNumber ) || pageNumber < 1 ) {
		return changePage( path )( 1 );
	}

	renderWithReduxStore(
		<CommentsManagement
			basePath={ path }
			changePage={ changePage( path ) }
			page={ pageNumber }
			siteFragment={ siteFragment }
			status={ status }
		/>,
		'primary',
		store
	);
};

export const postComments = ( { params, path, query, store } ) => {
	const siteFragment = route.getSiteFragment( path );

	if ( ! siteFragment ) {
		return page.redirect( '/comments/all' );
	}

	const status = mapPendingStatusToUnapproved( params.status );
	const postId = parseInt( params.post, 10 );

	if ( ! isFinite( postId ) ) {
		return page.redirect( `/comments/${ params.status }/${ siteFragment }` );
	}

	const pageNumber = parseInt( query.page, 10 );
	if ( isNaN( pageNumber ) || pageNumber < 1 ) {
		return changePage( path )( 1 );
	}

	renderWithReduxStore(
		<CommentsManagement
			basePath={ path }
			changePage={ changePage( path ) }
			page={ pageNumber }
			postId={ postId }
			siteFragment={ siteFragment }
			status={ status }
		/>,
		'primary',
		store
	);
};

export const comment = ( { params, path, store } ) => {
	const siteFragment = route.getSiteFragment( path );
	const commentId = parseInt( params.comment, 10 );

	if ( ! isFinite( commentId ) ) {
		return siteFragment
			? page.redirect( `/comments/all/${ siteFragment }` )
			: page.redirect( '/comments/all' );
	}

	renderWithReduxStore(
		<CommentsManagement basePath={ path } commentId={ commentId } siteFragment={ siteFragment } />,
		'primary',
		store
	);
};

export const redirect = ( { path } ) => {
	const siteFragment = route.getSiteFragment( path );
	if ( siteFragment ) {
		return page.redirect( `/comments/all/${ siteFragment }` );
	}
	return page.redirect( '/comments/all' );
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
