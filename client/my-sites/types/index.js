/**
 * Internal dependencies
 */
import { siteSelection, navigation, sites } from 'my-sites/controller';
import { list, redirect } from './controller';
import config from 'config';

export default function( router ) {
	if ( ! config.isEnabled( 'manage/custom-post-types' ) ) {
		return;
	}

	router( '/types/:type/:status?/:site', siteSelection, navigation, list );
	router( '/types/:type', siteSelection, sites );
	router( '/types', redirect );
}
