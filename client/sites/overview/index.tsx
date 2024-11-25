import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfJetpackNonAtomic,
	redirectIfP2,
	redirectIfCurrentUserCannot,
} from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import { OVERVIEW } from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import { overview } from './controller';

export default function () {
	page( '/sites/overview', siteSelection, sites, makeLayout, clientRender );
	page(
		'/sites/overview/:site',
		siteSelection,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		redirectIfCurrentUserCannot( 'manage_options' ),
		redirectIfP2,
		redirectIfJetpackNonAtomic,
		navigation,
		overview,
		siteDashboard( OVERVIEW ),
		makeLayout,
		clientRender
	);
}
