/** @format */

/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'client/my-sites/controller';
import paladinController from './controller';
import config from 'config';
import { makeLayout, render as clientRender } from 'client/controller';

export default function() {
	if ( config.isEnabled( 'paladin' ) ) {
		page( '/paladin', siteSelection, sites, makeLayout, clientRender );
		page(
			'/paladin/:domain',
			siteSelection,
			navigation,
			paladinController.activate,
			makeLayout,
			clientRender
		);
	}
}
