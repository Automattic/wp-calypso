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
	redirectToActivity,
	redirectToDefaultModulePage,
	redirectToDefaultSitePage,
	redirectToDefaultWordAdsPeriod,
} from './controller';
import { makeLayout, render as clientRender } from 'controller';

/**
 * Style dependencies
 */
import './style.scss';

const trackedPage = ( url, controller ) => {
	page( url, siteSelection, navigation, controller, makeLayout, clientRender );
};

export default function () {
	const validPeriods = [ 'day', 'week', 'month', 'year' ].join( '|' );

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
	].join( '|' );

	// Redirect this to default /stats/day/ view in order to keep
	// the paths and page view reporting consistent.
	page( '/stats', () => page.redirect( getStatsDefaultSitePage() ) );

	// Stat Overview Page
	trackedPage( `/stats/:period(${ validPeriods })`, overview );

	trackedPage( '/stats/insights', sites );

	// Stat Insights Page
	trackedPage( '/stats/insights/:site', insights );

	// Stat Site Pages
	trackedPage( `/stats/:period(${ validPeriods })/:site`, site );

	// Redirect this to default /stats/day/:module/:site view to
	// keep the paths and page view reporting consistent.
	page( `/stats/:module(${ validModules })/:site`, redirectToDefaultModulePage );

	// Stat Summary Pages
	trackedPage( `/stats/:period(${ validPeriods })/:module(${ validModules })/:site`, summary );

	// Stat Single Post Page
	trackedPage( '/stats/post/:post_id/:site', post );
	trackedPage( '/stats/page/:post_id/:site', post );

	// Stat Follows Page
	trackedPage( '/stats/follows/comment/:site', follows );
	trackedPage( '/stats/follows/comment/:page_num/:site', follows );

	page( '/stats/activity/:site?', redirectToActivity );

	trackedPage( `/stats/ads/:period(${ validPeriods })/:site`, wordAds );

	// Anything else should redirect to default WordAds stats page
	page( '/stats/wordads/(.*)', redirectToDefaultWordAdsPeriod );
	page( '/stats/ads/(.*)', redirectToDefaultWordAdsPeriod );

	// Anything else should redirect to default stats page
	page( '/stats/(.*)', redirectToDefaultSitePage );
}
