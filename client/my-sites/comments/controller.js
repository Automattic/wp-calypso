import page from '@automattic/calypso-router';
import { addQueryArgs, getSiteFragment } from 'calypso/lib/route';
import CommentsManagement from './main';

const mapPendingStatusToUnapproved = ( status ) => ( 'pending' === status ? 'unapproved' : status );

const sanitizeInt = ( number ) => {
	const integer = parseInt( number, 10 );
	return ! Number.isNaN( integer ) && integer > 0 ? integer : false;
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
