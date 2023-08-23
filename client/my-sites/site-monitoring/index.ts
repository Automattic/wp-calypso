import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { redirectHomeIfIneligible, siteMetrics } from './controller';

export default function () {
	page( '/site-monitoring', siteSelection, sites, makeLayout, clientRender );

	page(
		'/site-monitoring/:siteId/:tab(php|web|metrics)?',
		siteSelection,
		redirectHomeIfIneligible,
		navigation,
		siteMetrics,
		makeLayout,
		clientRender
	);
}
