import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender, redirectIfDuplicatedView } from 'calypso/controller';
import { getSiteFragment } from 'calypso/lib/route';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import { pages } from './controller';

export default function () {
	page(
		'/pages/:author(my)?/:status(published|drafts|scheduled|trashed)?/:domain?',
		siteSelection,
		redirectIfDuplicatedView( 'edit.php?post_type=page' ),
		navigation,
		pages,
		makeLayout,
		clientRender
	);

	page( '/pages/:domain?', siteSelection, navigation, pages, makeLayout, clientRender );

	page( '/pages/*', ( { path } ) => {
		const siteFragment = getSiteFragment( path );
		if ( siteFragment ) {
			page.redirect( `/pages/${ siteFragment }` );
			return;
		}

		page.redirect( '/pages' );
	} );
}
