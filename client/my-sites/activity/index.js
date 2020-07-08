/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { activity } from './controller';
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import wrapInSiteOffsetProvider from 'lib/wrap-in-site-offset';

export default function () {
	page( '/activity-log', siteSelection, sites, makeLayout, clientRender );

	page(
		'/activity-log/:site',
		siteSelection,
		navigation,
		activity,
		wrapInSiteOffsetProvider,
		makeLayout,
		clientRender
	);
}
