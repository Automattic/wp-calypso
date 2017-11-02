/** @format */
/**
 * External dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import React from 'react';
import page from 'page';
import { each, isNaN, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import CommentsManagement from './main';
import route, { addQueryArgs } from 'lib/route';
import { SITES_ONCE_CHANGED } from 'state/action-types';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';
import { changeCommentStatus } from 'state/comments/actions';
import { removeNotice } from 'state/notices/actions';
import { getNotices } from 'state/notices/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const mapPendingStatusToUnapproved = status => ( 'pending' === status ? 'unapproved' : status );

const sanitizeInt = number => {
	const integer = parseInt( number, 10 );
	return ! isNaN( integer ) && integer > 0 ? integer : false;
};

const changePage = path => pageNumber => {
	if ( window ) {
		window.scrollTo( 0, 0 );
	}
	return page( addQueryArgs( { page: pageNumber }, path ) );
};

export const siteComments = context => {
	const { params, path, query, store } = context;
	const siteFragment = route.getSiteFragment( path );

	if ( ! siteFragment ) {
		return page.redirect( '/comments/all' );
	}

	const status = mapPendingStatusToUnapproved( params.status );

	const pageNumber = sanitizeInt( query.page );
	if ( ! pageNumber ) {
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
	const postId = sanitizeInt( params.post );

	if ( ! postId ) {
		return page.redirect( `/comments/${ params.status }/${ siteFragment }` );
	}

	const pageNumber = sanitizeInt( query.page );
	if ( ! pageNumber ) {
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

const sanitizeQueryAction = action => {
	if ( ! action ) {
		return null;
	}

	const validActions = [ 'approve', 'trash', 'spam' ];
	return validActions.indexOf( action.toLowerCase() ) > -1 ? action.toLowerCase() : null;
};

const updateCommentStatus = ( siteId, postId, commentId, status ) =>
	withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_comment_management_mail_change_status', {
				status,
			} ),
			bumpStat( 'calypso_comment_management_mail', 'comment_status_changed_to_' + status )
		),
		changeCommentStatus( siteId, postId, commentId, status )
	);

export const comment = ( { query, params, path, store } ) => {
	const siteFragment = route.getSiteFragment( path );
	const commentId = sanitizeInt( params.comment );

	if ( ! commentId ) {
		return siteFragment
			? page.redirect( `/comments/all/${ siteFragment }` )
			: page.redirect( '/comments/all' );
	}

	const action = sanitizeQueryAction( query.action );
	const postId = sanitizeInt( query.postId );
	if ( action && postId ) {
		const { dispatch, getState } = store;
		const siteId = getSelectedSiteId( getState() );

		if ( ! siteId ) {
			dispatch( {
				type: SITES_ONCE_CHANGED,
				listener: () =>
					dispatch(
						updateCommentStatus( getSelectedSiteId( getState() ), postId, commentId, action )
					),
			} );
		} else {
			dispatch( updateCommentStatus( getSelectedSiteId( getState() ), postId, commentId, action ) );
		}
	}

	renderWithReduxStore(
		<CommentsManagement { ...{ action, basePath: path, commentId, siteFragment } } />,
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
