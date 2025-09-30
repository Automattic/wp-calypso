import page from '@automattic/calypso-router';
import { redirectIfDuplicatedView } from 'calypso/controller';
import { getSiteFragment } from 'calypso/lib/route';
import { navigation, siteSelection } from 'calypso/my-sites/controller';

export default function () {
	page(
		'/posts/:author(my)?/:status(published|drafts|scheduled|trashed)?/:domain?',
		siteSelection,
		redirectIfDuplicatedView( 'edit.php' ),
		navigation
	);

	page( '/posts/*', ( { path } ) => {
		const siteFragment = getSiteFragment( path );

		if ( siteFragment ) {
			return page.redirect( `/posts/my/${ siteFragment }` );
		}

		return page.redirect( '/posts/my' );
	} );
}
