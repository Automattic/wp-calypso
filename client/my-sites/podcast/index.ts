import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { siteSettings } from 'calypso/my-sites/site-settings/settings-controller';
import { createPodcast } from './controller';

export default function () {
	page( '/podcast', siteSelection, sites, makeLayout, clientRender );
	page( '/podcast/settings', siteSelection, sites, makeLayout, clientRender );
	page( '/podcast/setup', siteSelection, sites, makeLayout, clientRender );

	page(
		'/podcast/:site_id',
		siteSelection,
		navigation,
		siteSettings,
		createPodcast,
		makeLayout,
		clientRender
	);

	page(
		'/podcast/:section(settings|setup)/:site_id',
		siteSelection,
		navigation,
		siteSettings,
		createPodcast,
		makeLayout,
		clientRender
	);
}
