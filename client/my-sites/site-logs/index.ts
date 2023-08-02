import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { redirectHomeIfIneligible, siteLogs } from './controller';

export default function () {
	page( '/site-logs', siteSelection, sites, makeLayout, clientRender );

	page(
		'/site-logs/:siteId',
		siteSelection,
		redirectHomeIfIneligible,
		navigation,
		siteLogs,
		makeLayout,
		clientRender
	);
}
