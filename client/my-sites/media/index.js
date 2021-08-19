import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { getSiteFragment } from 'calypso/lib/route';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import mediaController from './controller';

export default function () {
	page( '/media', siteSelection, sites, makeLayout, clientRender );

	page(
		'/media/:filter(this-post|images|documents|videos|audio)?/:domain',
		siteSelection,
		navigation,
		mediaController.media,
		makeLayout,
		clientRender
	);

	page(
		'/media/:domain/:mediaId',
		siteSelection,
		navigation,
		mediaController.media,
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
