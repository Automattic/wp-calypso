/** @format */
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
import settingsController from 'my-sites/site-settings/settings-controller';

export default function() {
	page(
		'/settings/performance/:site_id',
		siteSelection,
		navigation,
		settingsController.siteSettings,
		performance,
		makeLayout,
		clientRender
	);
}
