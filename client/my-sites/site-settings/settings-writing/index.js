/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import controller from './controller';
import settingsController from 'my-sites/site-settings/settings-controller';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page(
		'/settings/writing/:site_id',
		siteSelection,
		navigation,
		settingsController.siteSettings,
		controller.writing,
		makeLayout,
		clientRender
	);

	if ( config.isEnabled( 'manage/site-settings/categories' ) ) {
		page( '/settings/taxonomies/:taxonomy', siteSelection, sites, makeLayout, clientRender );

		page(
			'/settings/taxonomies/:taxonomy/:site_id',
			siteSelection,
			navigation,
			settingsController.setScroll,
			controller.taxonomies,
			makeLayout,
			clientRender
		);
	}

	if ( config.isEnabled( 'manage/site-settings/podcasts' ) ) {
		page( '/settings/podcast', siteSelection, sites, makeLayout, clientRender );

		page(
			'/settings/podcast/:site_id',
			siteSelection,
			navigation,
			settingsController.setScroll,
			controller.podcast,
			makeLayout,
			clientRender
		);
	}
}
