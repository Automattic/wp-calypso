import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { setScroll, siteSettings } from 'calypso/my-sites/site-settings/settings-controller';
import { taxonomies, writing } from './controller';

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
