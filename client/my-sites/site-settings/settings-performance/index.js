/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection } from 'my-sites/controller';
import { performance } from './controller';
import { siteSettings } from 'my-sites/site-settings/settings-controller';

export default function () {
	page(
		'/settings/performance/:site_id',
		siteSelection,
		navigation,
		siteSettings,
		performance,
		makeLayout,
		clientRender
	);
}
