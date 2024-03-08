import page from '@automattic/calypso-router';
import { startsWith } from 'lodash';
import { addQueryArgs, getSiteFragment } from 'calypso/lib/route';
import CommentView from 'calypso/my-sites/comment/main';
import { removeNotice } from 'calypso/state/notices/actions';
import { getNotices } from 'calypso/state/notices/selectors';
import CommentsManagement from './main';

const mapPendingStatusToUnapproved = ( status ) => ( 'pending' === status ? 'unapproved' : status );

const sanitizeInt = ( number ) => {
	const integer = parseInt( number, 10 );
	return ! Number.isNaN( integer ) && integer > 0 ? integer : false;
};

const sanitizeQueryAction = ( action ) => {
	if ( ! action ) {
		return null;
	}

	const validActions = {
		approve: 'approved',
		edit: 'edit',
		unapprove: 'unapproved',
		trash: 'trash',
		spam: 'spam',
		delete: 'delete',
	};

	return validActions.hasOwnProperty( action.toLowerCase() )
		? validActions[ action.toLowerCase() ]
		: null;
};

const changePage = ( path ) => ( pageNumber ) => {
	if ( window ) {
		window.scrollTo( 0, 0 );
	}
	return page( addQueryArgs( { page: pageNumber }, path ) );
};

export const siteComments = ( context, next ) => {
	const { params, path, query } = context;
	const siteFragment = getSiteFragment( path );

	if ( ! siteFragment ) {
		return page.redirect( '/comments/all' );
	}

	const status = mapPendingStatusToUnapproved( params.status );
	const analyticsPath = `/comments/${ status }/:site`;

	const pageNumber = sanitizeInt( query.page ) || 1;

	context.primary = (
		<CommentsManagement
			analyticsPath={ analyticsPath }
			changePage={ changePage( path ) }
			page={ pageNumber }
			siteFragment={ siteFragment }
			status={ status }
		/>
	);
	next();
};

export const postComments = ( context, next ) => {
	const { params, path, query } = context;
	const siteFragment = getSiteFragment( path );

	if ( ! siteFragment ) {
		return page.redirect( '/comments/all' );
	}

	const status = mapPendingStatusToUnapproved( params.status );
	const postId = sanitizeInt( params.post );
	const analyticsPath = `/comments/${ status }/:site/:post`;

	if ( ! postId ) {
		return page.redirect( `/comments/${ params.status }/${ siteFragment }` );
	}

	const pageNumber = sanitizeInt( query.page ) || 1;

	context.primary = (
		<CommentsManagement
			analyticsPath={ analyticsPath }
			changePage={ changePage( path ) }
			page={ pageNumber }
			postId={ postId }
			siteFragment={ siteFragment }
			status={ status }
		/>
	);
	next();
};

export const comment = ( context, next ) => {
	const { params, path, query } = context;
	const siteFragment = getSiteFragment( path );
	const commentId = sanitizeInt( params.comment );

	if ( ! commentId ) {
		return siteFragment
			? page.redirect( `/comments/all/${ siteFragment }` )
			: page.redirect( '/comments/all' );
	}

	const action = sanitizeQueryAction( query.action );
	const redirectToPostView = ( postId ) => () =>
		page.redirect( `/comments/all/${ siteFragment }/${ postId }` );

	context.primary = <CommentView { ...{ action, commentId, siteFragment, redirectToPostView } } />;
	next();
};

export const redirect = ( { path } ) => {
	const siteFragment = getSiteFragment( path );
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
		notices.forEach( ( { noticeId } ) => {
			if ( startsWith( noticeId, 'comment-notice' ) ) {
				dispatch( removeNotice( noticeId ) );
			}
		} );
	}
	next();
};
