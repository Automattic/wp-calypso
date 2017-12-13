/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import statsController from './controller';
import config from 'config';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page(
		'/stats/activity/:site_id',
		siteSelection,
		navigation,
		statsController.activityLog,
		makeLayout,
		clientRender
	);

	if ( config.isEnabled( 'manage/stats' ) ) {
		// Stat Overview Page
		page( '/stats', siteSelection, navigation, statsController.overview, makeLayout, clientRender );
		page(
			'/stats/day',
			siteSelection,
			navigation,
			statsController.overview,
			makeLayout,
			clientRender
		);
		page(
			'/stats/week',
			siteSelection,
			navigation,
			statsController.overview,
			makeLayout,
			clientRender
		);
		page(
			'/stats/month',
			siteSelection,
			navigation,
			statsController.overview,
			makeLayout,
			clientRender
		);
		page(
			'/stats/year',
			siteSelection,
			navigation,
			statsController.overview,
			makeLayout,
			clientRender
		);

		// Stat Insights Page
		page(
			'/stats/insights/:site_id',
			siteSelection,
			navigation,
			statsController.insights,
			makeLayout,
			clientRender
		);

		// Stat Site Pages
		page(
			'/stats/day/:site_id',
			siteSelection,
			navigation,
			statsController.site,
			makeLayout,
			clientRender
		);
		page(
			'/stats/week/:site_id',
			siteSelection,
			navigation,
			statsController.site,
			makeLayout,
			clientRender
		);
		page(
			'/stats/month/:site_id',
			siteSelection,
			navigation,
			statsController.site,
			makeLayout,
			clientRender
		);
		page(
			'/stats/year/:site_id',
			siteSelection,
			navigation,
			statsController.site,
			makeLayout,
			clientRender
		);

		// Stat Summary Pages
		page(
			'/stats/:module/:site_id',
			siteSelection,
			navigation,
			statsController.summary,
			makeLayout,
			clientRender
		);
		page(
			'/stats/day/:module/:site_id',
			siteSelection,
			navigation,
			statsController.summary,
			makeLayout,
			clientRender
		);
		page(
			'/stats/week/:module/:site_id',
			siteSelection,
			navigation,
			statsController.summary,
			makeLayout,
			clientRender
		);
		page(
			'/stats/month/:module/:site_id',
			siteSelection,
			navigation,
			statsController.summary,
			makeLayout,
			clientRender
		);
		page(
			'/stats/year/:module/:site_id',
			siteSelection,
			navigation,
			statsController.summary,
			makeLayout,
			clientRender
		);

		// Stat Single Post Page
		page(
			'/stats/post/:post_id/:site_id',
			siteSelection,
			navigation,
			statsController.post,
			makeLayout,
			clientRender
		);
		page(
			'/stats/page/:post_id/:site_id',
			siteSelection,
			navigation,
			statsController.post,
			makeLayout,
			clientRender
		);

		// Stat Follows Page
		page(
			'/stats/follows/comment/:site_id',
			siteSelection,
			navigation,
			statsController.follows,
			makeLayout,
			clientRender
		);
		page(
			'/stats/follows/comment/:page_num/:site_id',
			siteSelection,
			navigation,
			statsController.follows,
			makeLayout,
			clientRender
		);

		// Reset first view
		if ( config.isEnabled( 'ui/first-view/reset-route' ) ) {
			page( '/stats/reset-first-view', statsController.resetFirstView, makeLayout, clientRender );
		}

		// Anything else should require site-selection
		page(
			'/stats/(.*)',
			siteSelection,
			statsController.redirectToDefaultSitePage,
			sites,
			makeLayout,
			clientRender
		);
	}
}
