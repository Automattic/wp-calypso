import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender, redirectIfDuplicatedView } from 'calypso/controller';
import { getSiteFragment } from 'calypso/lib/route';
import { siteSelection, sites } from 'calypso/my-sites/controller';

export default function () {
	page( '/media', siteSelection, sites, makeLayout, clientRender );

	page(
		'/media/:filter(this-post|images|documents|videos|audio)?/:domain',
		siteSelection,
		redirectIfDuplicatedView( 'upload.php' ),
		makeLayout,
		clientRender
	);

	page(
		'/media/:domain/:mediaId',
		siteSelection,
		redirectIfDuplicatedView( 'upload.php' ),
		makeLayout,
		clientRender
	);

	page( '/media/*', ( { path } ) => {
		const siteFragment = getSiteFragment( path );

		if ( siteFragment ) {
			return page.redirect( `/media/${ siteFragment }` );
		}

		return page.redirect( '/media' );
	} );
}
