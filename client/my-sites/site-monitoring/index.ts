import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { redirectHomeIfIneligible, siteMetrics } from './controller';

export default function () {
	page( '/site-metrics', siteSelection, sites, makeLayout, clientRender );

	page(
		'/site-metrics/:siteId',
		siteSelection,
		redirectHomeIfIneligible,
		navigation,
		siteMetrics,
		makeLayout,
		clientRender
	);
}
