/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection } from 'my-sites/controller';
import { jetpack } from './controller';
import { setScroll, siteSettings } from 'my-sites/site-settings/settings-controller';

export default function () {
	page(
		'/settings/jetpack/:site_id',
		siteSelection,
		navigation,
		setScroll,
		siteSettings,
		jetpack,
		makeLayout,
		clientRender
	);
}
