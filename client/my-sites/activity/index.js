/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { activity } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function () {
	page( '/activity-log', siteSelection, sites, makeLayout, clientRender );

	page( '/activity-log/:site', siteSelection, navigation, activity, makeLayout, clientRender );
}
