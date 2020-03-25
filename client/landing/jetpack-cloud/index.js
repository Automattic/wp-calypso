/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection } from 'my-sites/controller';
import { makeLayout, render as clientRender } from 'controller';
import { dashboard } from 'landing/jetpack-cloud/sections/dashboard/controller';

export default function() {
	page( '/', siteSelection, navigation, dashboard, makeLayout, clientRender );
}
