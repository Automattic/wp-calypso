import page from '@automattic/calypso-router';
import { addQueryArgs } from '@wordpress/url';
import { makeLayout, render as clientRender, redirectIfDuplicatedView } from 'calypso/controller';
import { getSiteFragment } from 'calypso/lib/route';
import { siteSelection, sites } from 'calypso/my-sites/controller';

const redirect = ( { path } ) => {
	const siteFragment = getSiteFragment( path );
	if ( siteFragment ) {
		return page.redirect( `/comments/all/${ siteFragment }` );
	}
	return page.redirect( '/comments/all' );
};

// wp-admin shows a confirmation screen for these, so an email link can't act on its own.
const COMMENT_ACTIONS = [ 'approve', 'trash', 'spam', 'delete' ];

export const getCommentAdminPath = ( { query } ) =>
	`comment.php?action=${ COMMENT_ACTIONS.includes( query?.action ) ? query.action : 'editcomment' }`;

const redirectToCommentIfDuplicatedView = ( wpAdminPath ) => ( context, next ) => {
	let url = typeof wpAdminPath === 'function' ? wpAdminPath( context ) : wpAdminPath;

	if ( context.params.commentStatus !== 'all' ) {
		url = addQueryArgs( url, {
			comment_status:
				context.params.commentStatus === 'pending' ? 'moderated' : context.params.commentStatus,
		} );
	}

	if ( context.params.post ) {
		url = addQueryArgs( url, { p: context.params.post } );
	}

	if ( context.params.comment ) {
		url = addQueryArgs( url, { c: context.params.comment } );
	}

	redirectIfDuplicatedView( url )( context, next );
};

export default function () {
	// Site View
	page(
		'/comments/:commentStatus(all|pending|approved|spam|trash)/:site',
		siteSelection,
		redirectToCommentIfDuplicatedView( 'edit-comments.php' )
	);

	// Post View
	page(
		'/comments/:commentStatus(all|pending|approved|spam|trash)/:site/:post',
		siteSelection,
		redirectToCommentIfDuplicatedView( 'edit-comments.php' )
	);

	// Comment View
	page(
		'/comment/:site/:comment',
		siteSelection,
		redirectToCommentIfDuplicatedView( getCommentAdminPath )
	);

	// Redirect
	page(
		'/comments/:commentStatus(all|pending|approved|spam|trash)',
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
