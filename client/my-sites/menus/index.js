/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { siteSelection, navigation, sites } from 'my-sites/controller';
import menus from './controller';

import { makeLayout, render as clientRender } from 'controller';

export default function() {
	if ( config.isEnabled( 'manage/menus' ) ) {
		page(
		 '/menus/:site_id',
		 siteSelection,
		 navigation,
		 menus,
		 makeLayout,
		 clientRender
		);
		page('/menus', sites, makeLayout, clientRender);
	}
}
