import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { siteSettings } from 'calypso/my-sites/site-settings/settings-controller';
import { createPodcastDistributionV2, createPodcastSettingsV2 } from './controller';

export default function () {
	page( '/settings/podcasting-v2/distribution', siteSelection, sites, makeLayout, clientRender );
	page(
		'/settings/podcasting-v2/distribution/:site_id',
		siteSelection,
		navigation,
		siteSettings,
		createPodcastDistributionV2,
		makeLayout,
		clientRender
	);
	page( '/settings/podcasting-v2', siteSelection, sites, makeLayout, clientRender );
	page(
		'/settings/podcasting-v2/:site_id',
		siteSelection,
		navigation,
		siteSettings,
		createPodcastSettingsV2,
		makeLayout,
		clientRender
	);
}
