/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import settingsController from 'my-sites/site-settings/settings-controller';
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection } from 'my-sites/controller';
import { security } from './controller';

export default function() {
	page(
		'/settings/security/:site_id',
		siteSelection,
		navigation,
		settingsController.setScroll,
		settingsController.siteSettings,
		security,
		makeLayout,
		clientRender
	);
}
