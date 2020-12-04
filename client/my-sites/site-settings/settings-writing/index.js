/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { podcasting, taxonomies, writing } from './controller';
import { setScroll, siteSettings } from 'calypso/my-sites/site-settings/settings-controller';

export default function () {
	page(
		'/settings/writing/:site_id',
		siteSelection,
		navigation,
		siteSettings,
		writing,
		makeLayout,
		clientRender
	);

	if ( config.isEnabled( 'manage/site-settings/categories' ) ) {
		page( '/settings/taxonomies/:taxonomy', siteSelection, sites, makeLayout, clientRender );

		page(
			'/settings/taxonomies/:taxonomy/:site_id',
			siteSelection,
			navigation,
			setScroll,
			taxonomies,
			makeLayout,
			clientRender
		);
	}

	page( '/settings/podcasting', siteSelection, sites, makeLayout, clientRender );

	page(
		'/settings/podcasting/:site_id',
		siteSelection,
		navigation,
		setScroll,
		podcasting,
		makeLayout,
		clientRender
	);
}
