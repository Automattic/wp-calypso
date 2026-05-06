import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { siteSettings } from 'calypso/my-sites/site-settings/settings-controller';
import { createPodcast } from './controller';

export default function () {
	page( '/settings/podcast', siteSelection, sites, makeLayout, clientRender );
	page( '/settings/podcast/episodes', siteSelection, sites, makeLayout, clientRender );
	page( '/settings/podcast/distribution', siteSelection, sites, makeLayout, clientRender );
	page( '/settings/podcast/settings', siteSelection, sites, makeLayout, clientRender );

	page(
		'/settings/podcast/:site_id',
		siteSelection,
		navigation,
		siteSettings,
		createPodcast,
		makeLayout,
		clientRender
	);

	page(
		'/settings/podcast/:section(episodes|distribution|settings)/:site_id',
		siteSelection,
		navigation,
		siteSettings,
		createPodcast,
		makeLayout,
		clientRender
	);
}
