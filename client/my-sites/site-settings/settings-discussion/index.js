/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import settingsController from 'my-sites/site-settings/settings-controller';
import { discussion } from './controller';
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection } from 'my-sites/controller';

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
