import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender, redirectIfDuplicatedView } from 'calypso/controller';
import { getSiteFragment } from 'calypso/lib/route';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import postsController from './controller';

export default function () {
	page(
		'/posts/:author(my)?/:status(published|drafts|scheduled|trashed)?/:domain?',
		siteSelection,
		redirectIfDuplicatedView( 'edit.php' ),
		navigation,
		postsController.posts,
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
