/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { jetpackSearchIndex } from 'calypso/my-sites/jetpack-search/controller';
import { jetpackSearchMainPath } from './paths';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';

export default function () {
	/* handles /jetpack-search/:site, see `jetpackSearchMainPath` */
	page(
		jetpackSearchMainPath( ':site' ),
		siteSelection,
		navigation,
		jetpackSearchIndex,
		makeLayout,
		clientRender
	);
	/* handles /jetpack-search, see `jetpackSearchMainPath` */
	page( jetpackSearchMainPath(), siteSelection, sites, makeLayout, clientRender );
}
