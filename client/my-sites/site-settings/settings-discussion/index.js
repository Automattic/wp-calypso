/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { discussion } from './controller';
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection } from 'my-sites/controller';
import { siteSettings } from 'my-sites/site-settings/settings-controller';

export default function () {
	page(
		'/settings/discussion/:site_id',
		siteSelection,
		navigation,
		siteSettings,
		discussion,
		makeLayout,
		clientRender
	);
}
