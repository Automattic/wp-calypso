/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import settingsController from 'my-sites/site-settings/settings-controller';
import { navigation, siteSelection } from 'my-sites/controller';

export default function() {
	page(
		'/settings/discussion/:site_id',
		siteSelection,
		navigation,
		settingsController.siteSettings,
		controller.discussion
	);
}
