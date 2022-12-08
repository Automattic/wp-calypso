import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import { siteSettings } from 'calypso/my-sites/site-settings/settings-controller';
import { createReadingSettings } from './controller';

export default function () {
	page(
		'/settings/reading/:site_id',
		siteSelection,
		navigation,
		siteSettings,
		createReadingSettings,
		makeLayout,
		clientRender
	);
}
