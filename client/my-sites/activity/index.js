import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import wrapInSiteOffsetProvider from 'calypso/lib/wrap-in-site-offset';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { activity, showNotAuthorizedForNonAdmins } from './controller';

export default function () {
	page( '/activity-log', siteSelection, sites, makeLayout, clientRender );

	page(
		'/activity-log/:site',
		siteSelection,
		navigation,
		activity,
		showNotAuthorizedForNonAdmins,
		wrapInSiteOffsetProvider,
		makeLayout,
		clientRender
	);
}
