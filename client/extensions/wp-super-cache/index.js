/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, sites, siteSelection } from 'my-sites/controller';
import controller from './controller';

import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page(
	 '/extensions/wp-super-cache',
	 siteSelection,
	 sites,
	 navigation,
	 controller.settings,
	 makeLayout,
	 clientRender
	);
	page(
	 '/extensions/wp-super-cache/:tab?/:site',
	 siteSelection,
	 navigation,
	 controller.settings,
	 makeLayout,
	 clientRender
	);
}
