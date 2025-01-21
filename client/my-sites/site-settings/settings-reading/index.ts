import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender, redirectIfDuplicatedView } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import { siteSettings } from 'calypso/my-sites/site-settings/settings-controller';
import { createReadingSettings } from './controller';

export default function () {
	page(
		'/settings/reading/:site_id',
		siteSelection,
		redirectIfDuplicatedView( 'options-reading.php' ),
		navigation,
		siteSettings,
		createReadingSettings,
		makeLayout,
		clientRender
	);
}
