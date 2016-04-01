/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { siteSelection, navigation, sites } from 'my-sites/controller';
import { list, redirect } from './controller';
import config from 'config';

export default function() {
	if ( ! config.isEnabled( 'manage/custom-post-types' ) ) {
		return;
	}

	page( '/types/:type/:status?/:site', siteSelection, navigation, list );
	page( '/types/:type', siteSelection, sites );
	page( '/types', redirect );
};
