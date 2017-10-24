/**
 * External dependencies
 *
 * @format
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { siteSelection, sites, navigation } from 'my-sites/controller';
import mediaController from './controller';
import config from 'config';

export default function() {
	if ( config.isEnabled( 'manage/media' ) ) {
		page( '/media', siteSelection, sites );
		page( '/media/:filter?/:domain', siteSelection, navigation, mediaController.media );
	}
}
