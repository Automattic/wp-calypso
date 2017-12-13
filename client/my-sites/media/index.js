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
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	if ( config.isEnabled( 'manage/media' ) ) {
		page( '/media', siteSelection, sites, makeLayout, clientRender );
		page(
			'/media/:filter?/:domain',
			siteSelection,
			navigation,
			mediaController.media,
			makeLayout,
			clientRender
		);
	}
}
