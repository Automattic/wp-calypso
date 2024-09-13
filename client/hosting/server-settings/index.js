import page from '@automattic/calypso-router';
import {
	makeLayout,
	redirectIfCurrentUserCannot,
	render as clientRender,
} from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { handleHostingPanelRedirect, layout, activationLayout } from './controller';

// TODO: remove this old unused code
// Details - https://a8c.slack.com/archives/C06DN6QQVAQ/p1726157495064039
export default function () {
	page( '/hosting-config', siteSelection, sites, makeLayout, clientRender );
	page(
		'/hosting-config/:site_id',
		siteSelection,
		navigation,
		redirectIfCurrentUserCannot( 'manage_options' ),
		handleHostingPanelRedirect,
		layout,
		makeLayout,
		clientRender
	);

	page(
		'/hosting-config/activate/:site_id',
		siteSelection,
		navigation,
		redirectIfCurrentUserCannot( 'manage_options' ),
		handleHostingPanelRedirect,
		activationLayout,
		makeLayout,
		clientRender
	);
}
