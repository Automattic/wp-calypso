/** @format */

/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import mediaController from './controller';
import config from 'config';

export default function() {
	if ( config.isEnabled( 'manage/media' ) ) {
		page( '/media', siteSelection, sites );
		page( '/media/:filter?/:domain', siteSelection, navigation, mediaController.media );
	}
}
