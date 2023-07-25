import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import { getSiteFragment } from 'calypso/lib/route';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import * as controller from './controller';

export default function () {
	page(
		'/posts/:author(my)?/:status(published|drafts|scheduled|trashed)?/:domain?',
		siteSelection,
		navigation,
		controller.posts,
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
