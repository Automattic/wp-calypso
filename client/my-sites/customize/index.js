/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { customize } from './controller';
import config from 'calypso/config';
import { makeLayout, render as clientRender } from 'calypso/controller';

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
