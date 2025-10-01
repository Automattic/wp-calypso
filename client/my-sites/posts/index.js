import page from '@automattic/calypso-router';
import { redirectIfDuplicatedView, makeLayout, render as clientRender } from 'calypso/controller';
import { getSiteFragment } from 'calypso/lib/route';
import { siteSelection, sites } from 'calypso/my-sites/controller';

export default function () {
	page(
		'/posts/:author?/:status(published|drafts|scheduled|trashed)?/:domain?',
		siteSelection,
		redirectIfDuplicatedView( 'edit.php' ),
		sites,
		makeLayout,
		clientRender
	);

	page( '/posts/*', ( { path } ) => {
		const siteFragment = getSiteFragment( path );

		if ( siteFragment ) {
			return page.redirect( `/posts/my/${ siteFragment }` );
		}

		return page.redirect( '/posts/my' );
	} );
}
