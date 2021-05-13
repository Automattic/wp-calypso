/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { activity, showNotAuthorizedForNonAdmins } from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import wrapInSiteOffsetProvider from 'calypso/lib/wrap-in-site-offset';

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
