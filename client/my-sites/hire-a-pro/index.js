/** @format */

/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { layout } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	if ( config.isEnabled( 'manage/hire-a-builder' ) ) {
		page( '/hire-a-pro', ...[ siteSelection, sites, makeLayout, clientRender ] );

		page( '/hire-a-pro/:domain', siteSelection, navigation, layout, makeLayout, clientRender );
	}
}
