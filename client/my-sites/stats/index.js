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
import { redirect as redirectToAcivity } from 'my-sites/activity/controller';
import config from 'config';
import { makeLayout, render as clientRender } from 'controller';
import { trackNavigationStart } from 'lib/performance-tracking';

/**
 * Style dependencies
 */
import './style.scss';

export default function () {
	const validPeriods = [ 'day', 'week', 'month', 'year' ];

	if ( config.isEnabled( 'manage/stats' ) ) {
		// Redirect this to default /stats/day/ view in order to keep
		// the paths and page view reporting consistent.
		page( '/stats', () => page.redirect( getStatsDefaultSitePage() ) );

		// Stat Overview Page
		page(
			'/stats/day',
			trackNavigationStart( 'stats' ),
			siteSelection,
			navigation,
			statsController.overview,
			makeLayout,
			clientRender
		);
		page(
			'/stats/week',
			trackNavigationStart( 'stats' ),
			siteSelection,
			navigation,
			statsController.overview,
			makeLayout,
			clientRender
		);
		page(
			'/stats/month',
			trackNavigationStart( 'stats' ),
			siteSelection,
			navigation,
			statsController.overview,
			makeLayout,
			clientRender
		);
		page(
			'/stats/year',
			trackNavigationStart( 'stats' ),
			siteSelection,
			navigation,
			statsController.overview,
			makeLayout,
			clientRender
		);

		page(
			'/stats/insights',
			trackNavigationStart( 'stats' ),
			siteSelection,
			navigation,
			sites,
			makeLayout,
			clientRender
		);

		// Stat Insights Page
		page(
			'/stats/insights/:site',
			trackNavigationStart( 'stats' ),
			siteSelection,
			navigation,
			statsController.insights,
			makeLayout,
			clientRender
		);

		// Stat Site Pages
		page(
			'/stats/day/:site',
			trackNavigationStart( 'stats' ),
			siteSelection,
			navigation,
			statsController.site,
			makeLayout,
			clientRender
		);
		page(
			'/stats/week/:site',
			trackNavigationStart( 'stats' ),
			siteSelection,
			navigation,
			statsController.site,
			makeLayout,
			clientRender
		);
		page(
			'/stats/month/:site',
			trackNavigationStart( 'stats' ),
			siteSelection,
			navigation,
			statsController.site,
			makeLayout,
			clientRender
		);
		page(
			'/stats/year/:site',
			trackNavigationStart( 'stats' ),
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
			'filedownloads',
			'searchterms',
			'annualstats',
		];

		// Redirect this to default /stats/day/:module/:site view to
		// keep the paths and page view reporting consistent.
		page(
			`/stats/:module(${ validModules.join( '|' ) })/:site`,
			statsController.redirectToDefaultModulePage
		);

		// Stat Summary Pages
		page(
			`/stats/day/:module(${ validModules.join( '|' ) })/:site`,
			trackNavigationStart( 'stats' ),
			siteSelection,
			navigation,
			statsController.summary,
			makeLayout,
			clientRender
		);
		page(
			`/stats/week/:module(${ validModules.join( '|' ) })/:site`,
			trackNavigationStart( 'stats' ),
			siteSelection,
			navigation,
			statsController.summary,
			makeLayout,
			clientRender
		);
		page(
			`/stats/month/:module(${ validModules.join( '|' ) })/:site`,
			trackNavigationStart( 'stats' ),
			siteSelection,
			navigation,
			statsController.summary,
			makeLayout,
			clientRender
		);
		page(
			`/stats/year/:module(${ validModules.join( '|' ) })/:site`,
			trackNavigationStart( 'stats' ),
			siteSelection,
			navigation,
			statsController.summary,
			makeLayout,
			clientRender
		);

		// Stat Single Post Page
		page(
			'/stats/post/:post_id/:site',
			trackNavigationStart( 'stats' ),
			siteSelection,
			navigation,
			statsController.post,
			makeLayout,
			clientRender
		);
		page(
			'/stats/page/:post_id/:site',
			trackNavigationStart( 'stats' ),
			siteSelection,
			navigation,
			statsController.post,
			makeLayout,
			clientRender
		);

		// Stat Follows Page
		page(
			'/stats/follows/comment/:site',
			trackNavigationStart( 'stats' ),
			siteSelection,
			navigation,
			statsController.follows,
			makeLayout,
			clientRender
		);
		page(
			'/stats/follows/comment/:page_num/:site',
			trackNavigationStart( 'stats' ),
			siteSelection,
			navigation,
			statsController.follows,
			makeLayout,
			clientRender
		);

		page(
			'/stats/activity',
			trackNavigationStart( 'stats' ),
			siteSelection,
			sites,
			redirectToAcivity,
			makeLayout,
			clientRender
		);

		page(
			'/stats/activity/:site',
			trackNavigationStart( 'stats' ),
			siteSelection,
			navigation,
			redirectToAcivity,
			makeLayout,
			clientRender
		);

		page(
			`/stats/ads/:period(${ validPeriods.join( '|' ) })/:site`,
			trackNavigationStart( 'stats' ),
			siteSelection,
			navigation,
			statsController.wordAds,
			makeLayout,
			clientRender
		);

		// Anything else should redirect to default WordAds stats page
		page( '/stats/wordads/(.*)', statsController.redirectToDefaultWordAdsPeriod );
		page( '/stats/ads/(.*)', statsController.redirectToDefaultWordAdsPeriod );

		// Anything else should redirect to default stats page
		page( '/stats/(.*)', statsController.redirectToDefaultSitePage );
	}
}
