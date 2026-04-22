import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { siteSettings } from 'calypso/my-sites/site-settings/settings-controller';
import { createPodcasting } from './controller';

export default function () {
	page( '/podcasting', siteSelection, sites, makeLayout, clientRender );
	page( '/podcasting/settings', siteSelection, sites, makeLayout, clientRender );
	page( '/podcasting/setup', siteSelection, sites, makeLayout, clientRender );

	page(
		'/podcasting/:site_id',
		siteSelection,
		navigation,
		siteSettings,
		createPodcasting,
		makeLayout,
		clientRender
	);

	page(
		'/podcasting/:section(settings|setup)/:site_id',
		siteSelection,
		navigation,
		siteSettings,
		createPodcasting,
		makeLayout,
		clientRender
	);
}
