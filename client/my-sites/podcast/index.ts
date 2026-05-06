import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { siteSettings } from 'calypso/my-sites/site-settings/settings-controller';
import { createPodcast, createPodcastEpisodeStats } from './controller';

export default function () {
	page( '/podcasting', siteSelection, sites, makeLayout, clientRender );
	page( '/podcasting/episodes', siteSelection, sites, makeLayout, clientRender );
	page( '/podcasting/distribution', siteSelection, sites, makeLayout, clientRender );
	page( '/podcasting/settings', siteSelection, sites, makeLayout, clientRender );
	page( '/podcasting/stats', siteSelection, sites, makeLayout, clientRender );

	page(
		'/podcasting/:site_id',
		siteSelection,
		navigation,
		siteSettings,
		createPodcast,
		makeLayout,
		clientRender
	);

	page(
		'/podcasting/:section(episodes|distribution|settings|stats)/:site_id',
		siteSelection,
		navigation,
		siteSettings,
		createPodcast,
		makeLayout,
		clientRender
	);

	page(
		'/podcasting/episode/:postId/:site_id',
		siteSelection,
		navigation,
		siteSettings,
		createPodcastEpisodeStats,
		makeLayout,
		clientRender
	);
}
