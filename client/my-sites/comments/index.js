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

const redirectToCommentIfDuplicatedView = ( url ) => ( context, next ) => {
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
	page( '/comment/:site/:comment', siteSelection, ( context, next ) => {
		// wp-admin asks for confirmation on these, so email action links stay safe.
		const { action } = context.query;
		const adminAction = [ 'approve', 'trash', 'spam', 'delete' ].includes( action )
			? action
			: 'editcomment';
		redirectToCommentIfDuplicatedView( `comment.php?action=${ adminAction }` )( context, next );
	} );

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
