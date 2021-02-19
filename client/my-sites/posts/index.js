/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal Dependencies
 */
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import postsController from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { getSiteFragment } from 'calypso/lib/route';

export default function () {
	page(
		'/posts/:author(my)?/:status(published|drafts|scheduled|trashed)?/:domain?',
		siteSelection,
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
