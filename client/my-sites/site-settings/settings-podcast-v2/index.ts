import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { createPodcastDistributionV2, createPodcastSettingsV2 } from './controller';

export default function () {
	page(
		'/settings/podcasting-v2/distribution',
		createPodcastDistributionV2,
		makeLayout,
		clientRender
	);
	page(
		'/settings/podcasting-v2/distribution/:site_id',
		createPodcastDistributionV2,
		makeLayout,
		clientRender
	);
	page( '/settings/podcasting-v2', createPodcastSettingsV2, makeLayout, clientRender );
	page( '/settings/podcasting-v2/:site_id', createPodcastSettingsV2, makeLayout, clientRender );
}
