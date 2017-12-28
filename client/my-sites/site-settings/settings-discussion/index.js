/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import settingsController from 'client/my-sites/site-settings/settings-controller';
import { navigation, siteSelection } from 'client/my-sites/controller';
import { makeLayout, render as clientRender } from 'client/controller';

export default function() {
	page(
		'/settings/discussion/:site_id',
		siteSelection,
		navigation,
		settingsController.siteSettings,
		controller.discussion,
		makeLayout,
		clientRender
	);
}
