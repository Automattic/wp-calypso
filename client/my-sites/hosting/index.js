import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	redirectIfInsufficientPrivileges,
	handleHostingPanelRedirect,
	layout,
	activationLayout,
} from './controller';

export default function () {
	page( '/hosting-config', siteSelection, sites, makeLayout, clientRender );
	page(
		'/hosting-config/:site_id',
		siteSelection,
		navigation,
		redirectIfInsufficientPrivileges,
		handleHostingPanelRedirect,
		layout,
		makeLayout,
		clientRender
	);

	page(
		'/hosting-config/activate/:site_id',
		siteSelection,
		navigation,
		redirectIfInsufficientPrivileges,
		handleHostingPanelRedirect,
		activationLayout,
		makeLayout,
		clientRender
	);
}
