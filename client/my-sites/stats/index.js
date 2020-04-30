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

const trackedPage = ( url, controller ) => {
	page(
		url,
		trackNavigationStart( 'stats' ),
		siteSelection,
		navigation,
		controller,
		makeLayout,
		clientRender
	);
};

export default function () {
	const validPeriods = [ 'day', 'week', 'month', 'year' ];

	if ( config.isEnabled( 'manage/stats' ) ) {
		// Redirect this to default /stats/day/ view in order to keep
		// the paths and page view reporting consistent.
		page( '/stats', () => page.redirect( getStatsDefaultSitePage() ) );

		// Stat Overview Page
		trackedPage( '/stats/day', statsController.overview );
		trackedPage( '/stats/week', statsController.overview );
		trackedPage( '/stats/month', statsController.overview );
		trackedPage( '/stats/year', statsController.overview );

		trackedPage( '/stats/insights', sites );

		// Stat Insights Page
		trackedPage( '/stats/insights/:site', statsController.insights );

		// Stat Site Pages
		trackedPage( '/stats/day/:site', statsController.site );
		trackedPage( '/stats/week/:site', statsController.site );
		trackedPage( '/stats/month/:site', statsController.site );
		trackedPage( '/stats/year/:site', statsController.site );

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
		trackedPage(
			`/stats/day/:module(${ validModules.join( '|' ) })/:site`,
			statsController.summary
		);
		trackedPage(
			`/stats/week/:module(${ validModules.join( '|' ) })/:site`,
			statsController.summary
		);
		trackedPage(
			`/stats/month/:module(${ validModules.join( '|' ) })/:site`,
			statsController.summary
		);
		trackedPage(
			`/stats/year/:module(${ validModules.join( '|' ) })/:site`,
			statsController.summary
		);

		// Stat Single Post Page
		trackedPage( '/stats/post/:post_id/:site', statsController.post );
		trackedPage( '/stats/page/:post_id/:site', statsController.post );

		// Stat Follows Page
		trackedPage( '/stats/follows/comment/:site', statsController.follows );
		trackedPage( '/stats/follows/comment/:page_num/:site', statsController.follows );

		// Can't convert to trackedPage because it uses `sites` instead of `navigation`
		page(
			'/stats/activity',
			trackNavigationStart( 'stats' ),
			siteSelection,
			sites,
			redirectToAcivity,
			makeLayout,
			clientRender
		);

		trackedPage( '/stats/activity/:site', redirectToAcivity );

		trackedPage(
			`/stats/ads/:period(${ validPeriods.join( '|' ) })/:site`,
			statsController.wordAds
		);

		// Anything else should redirect to default WordAds stats page
		page( '/stats/wordads/(.*)', statsController.redirectToDefaultWordAdsPeriod );
		page( '/stats/ads/(.*)', statsController.redirectToDefaultWordAdsPeriod );

		// Anything else should redirect to default stats page
		page( '/stats/(.*)', statsController.redirectToDefaultSitePage );
	}
}
