/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { siteSelection, sites, navigation } from 'my-sites/controller';
import { customize } from './controller';
import config from 'config';
import { makeLayout, render as clientRender } from 'controller';

export default function () {
	if ( config.isEnabled( 'manage/customize' ) ) {
		page( '/customize/:panel([^.]+)?', siteSelection, sites, makeLayout, clientRender );
		page(
			'/customize/:panel?/:domain',
			siteSelection,
			navigation,
			customize,
			makeLayout,
			clientRender
		);
	}
}
