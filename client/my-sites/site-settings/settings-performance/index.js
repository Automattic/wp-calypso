/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import { navigation, siteSelection } from 'my-sites/controller';
import settingsController from 'my-sites/site-settings/settings-controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page(
		'/settings/performance/:site_id',
		siteSelection,
		navigation,
		settingsController.siteSettings,
		controller.performance,
		makeLayout,
		clientRender
	);
}
