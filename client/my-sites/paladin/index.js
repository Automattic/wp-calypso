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
import paladinController from './controller';
import config from 'config';

export default function() {
	if ( config.isEnabled( 'paladin' ) ) {
		page( '/paladin', siteSelection, sites );
		page( '/paladin/:domain', siteSelection, navigation, paladinController.activate );
	}
}
