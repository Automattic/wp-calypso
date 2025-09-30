import page from '@automattic/calypso-router';
import { addQueryArgs } from '@wordpress/url';
import { makeLayout, render as clientRender, redirectIfDuplicatedView } from 'calypso/controller';
import { getSiteFragment } from 'calypso/lib/route';
import { siteSelection, sites } from 'calypso/my-sites/controller';
import { postComments, siteComments } from './controller';

export const redirect = ( { path } ) => {
	const siteFragment = getSiteFragment( path );
	if ( siteFragment ) {
		return page.redirect( `/comments/all/${ siteFragment }` );
	}
	return page.redirect( '/comments/all' );
};

const redirectToCommentIfDuplicatedView = ( url ) => ( context, next ) => {
	if ( context.params.status !== 'all' ) {
		url = addQueryArgs( url, {
			comment_status: context.params.status === 'pending' ? 'moderated' : context.params.status,
		} );
	}

	if ( context.params.comment ) {
		url = addQueryArgs( url, { c: context.params.comment } );
	}

	redirectIfDuplicatedView( url )( context, next );
};

export default function () {
	// Site View
	page(
		'/comments/:status(all|pending|approved|spam|trash)/:site',
		siteSelection,
		redirectToCommentIfDuplicatedView( 'edit-comments.php' ),
		siteComments
	);

	// Post View
	page(
		'/comments/:status(all|pending|approved|spam|trash)/:site/:post',
		siteSelection,
		redirectToCommentIfDuplicatedView( 'edit-comments.php' ),
		postComments
	);

	// Comment View
	page(
		'/comment/:site/:comment',
		siteSelection,
		redirectToCommentIfDuplicatedView( 'comment.php?action=editcomment' )
	);

	// Redirect
	page(
		'/comments/:status(all|pending|approved|spam|trash)',
		siteSelection,
		sites,
		makeLayout,
		clientRender
	);
	page( '/comments/*', siteSelection, redirect );
	page( '/comments', siteSelection, redirect );
	page( '/comment/*', siteSelection, redirect );
	page( '/comment', siteSelection, redirect );
}
