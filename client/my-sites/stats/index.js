/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { getStatsDefaultSitePage } from 'lib/route';
import statsController from './controller';
import config from 'config';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/stats/activity', siteSelection, sites, makeLayout, clientRender );

	page(
		'/stats/activity/:site_id',
		siteSelection,
		navigation,
		statsController.activityLog,
		makeLayout,
		clientRender
	);

	if ( config.isEnabled( 'manage/stats' ) ) {
		// Redirect this to default /stats/day/ view in order to keep
		// the paths and page view reporting consistent.
		page( '/stats', () => page.redirect( getStatsDefaultSitePage() ) );

		// Stat Overview Page
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

		page( '/stats/insights', siteSelection, navigation, sites, makeLayout, clientRender );

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

		const validModules = [
			'posts',
			'referrers',
			'clicks',
			'countryviews',
			'authors',
			'videoplays',
			'videodetails',
			'podcastdownloads',
			'searchterms',
			'annualstats',
		];

		// Redirect this to default /stats/day/:module/:site_id view to
		// keep the paths and page view reporting consistent.
		page(
			`/stats/:module(${ validModules.join( '|' ) })/:site_id`,
			statsController.redirectToDefaultModulePage
		);

		// Stat Summary Pages
		page(
			`/stats/day/:module(${ validModules.join( '|' ) })/:site_id`,
			siteSelection,
			navigation,
			statsController.summary,
			makeLayout,
			clientRender
		);
		page(
			`/stats/week/:module(${ validModules.join( '|' ) })/:site_id`,
			siteSelection,
			navigation,
			statsController.summary,
			makeLayout,
			clientRender
		);
		page(
			`/stats/month/:module(${ validModules.join( '|' ) })/:site_id`,
			siteSelection,
			navigation,
			statsController.summary,
			makeLayout,
			clientRender
		);
		page(
			`/stats/year/:module(${ validModules.join( '|' ) })/:site_id`,
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

		// Anything else should redirect to default stats page
		page( '/stats/(.*)', statsController.redirectToDefaultSitePage );
	}
}
