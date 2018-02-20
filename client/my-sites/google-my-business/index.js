/** @format */

/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { selectBusinessType } from './controller';
import config from 'config';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	if ( config.isEnabled( 'google-my-business' ) ) {
		page( '/google-my-business', siteSelection, sites, makeLayout, clientRender );
		page(
			'/google-my-business/:site_id/',
			siteSelection,
			navigation,
			selectBusinessType,
			makeLayout,
			clientRender
		);
	}
}
