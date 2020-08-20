/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { getStatsDefaultSitePage } from 'lib/route';
import {
	follows,
	insights,
	overview,
	post,
	site,
	summary,
	wordAds,
	redirectToDefaultModulePage,
	redirectToDefaultSitePage,
	redirectToDefaultWordAdsPeriod,
} from './controller';
import { redirect as redirectToAcivity } from 'my-sites/activity/controller';
import { makeLayout, render as clientRender } from 'controller';

/**
 * Style dependencies
 */
import './style.scss';

const trackedPage = ( url, controller ) => {
	page( url, siteSelection, navigation, controller, makeLayout, clientRender );
};

export default function () {
	const validPeriods = [ 'day', 'week', 'month', 'year' ];

	// Redirect this to default /stats/day/ view in order to keep
	// the paths and page view reporting consistent.
	page( '/stats', () => page.redirect( getStatsDefaultSitePage() ) );

	// Stat Overview Page
	trackedPage( '/stats/day', overview );
	trackedPage( '/stats/week', overview );
	trackedPage( '/stats/month', overview );
	trackedPage( '/stats/year', overview );

	trackedPage( '/stats/insights', sites );

	// Stat Insights Page
	trackedPage( '/stats/insights/:site', insights );

	// Stat Site Pages
	trackedPage( '/stats/day/:site', site );
	trackedPage( '/stats/week/:site', site );
	trackedPage( '/stats/month/:site', site );
	trackedPage( '/stats/year/:site', site );

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
	page( `/stats/:module(${ validModules.join( '|' ) })/:site`, redirectToDefaultModulePage );

	// Stat Summary Pages
	trackedPage( `/stats/day/:module(${ validModules.join( '|' ) })/:site`, summary );
	trackedPage( `/stats/week/:module(${ validModules.join( '|' ) })/:site`, summary );
	trackedPage( `/stats/month/:module(${ validModules.join( '|' ) })/:site`, summary );
	trackedPage( `/stats/year/:module(${ validModules.join( '|' ) })/:site`, summary );

	// Stat Single Post Page
	trackedPage( '/stats/post/:post_id/:site', post );
	trackedPage( '/stats/page/:post_id/:site', post );

	// Stat Follows Page
	trackedPage( '/stats/follows/comment/:site', follows );
	trackedPage( '/stats/follows/comment/:page_num/:site', follows );

	// Can't convert to trackedPage because it uses `sites` instead of `navigation`
	page( '/stats/activity', siteSelection, sites, redirectToAcivity, makeLayout, clientRender );

	trackedPage( '/stats/activity/:site', redirectToAcivity );

	trackedPage( `/stats/ads/:period(${ validPeriods.join( '|' ) })/:site`, wordAds );

	// Anything else should redirect to default WordAds stats page
	page( '/stats/wordads/(.*)', redirectToDefaultWordAdsPeriod );
	page( '/stats/ads/(.*)', redirectToDefaultWordAdsPeriod );

	// Anything else should redirect to default stats page
	page( '/stats/(.*)', redirectToDefaultSitePage );
}
