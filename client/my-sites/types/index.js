/**
 * Internal dependencies
 */
import { list, redirect } from './controller';
import config from 'config';
import { makeLayout } from 'controller';
import { siteSelection, makeNavigation, sites } from 'my-sites/controller';

export default function( router ) {
	if ( ! config.isEnabled( 'manage/custom-post-types' ) ) {
		return;
	}

	router( '/types/:type/:status?/:site', siteSelection, makeNavigation, list, makeLayout );
	router( '/types/:type', siteSelection, sites, makeLayout );
	router( '/types', redirect );
}
