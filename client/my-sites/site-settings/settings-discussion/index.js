/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { discussion } from './controller';
import settingsController from 'my-sites/site-settings/settings-controller';
import { navigation, siteSelection } from 'my-sites/controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page(
		'/settings/discussion/:site_id',
		siteSelection,
		navigation,
		settingsController.siteSettings,
		discussion,
		makeLayout,
		clientRender
	);
}
