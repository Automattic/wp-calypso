/** @format */

/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import paladinController from './controller';
import config from 'config';
import { makeLayout, render as clientRender } from 'controller';

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
