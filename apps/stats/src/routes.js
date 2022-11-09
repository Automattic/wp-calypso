import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
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
} from 'calypso/my-sites/stats/controller';

import 'calypso/my-sites/stats/style.scss';

// all Stats pages (except redirects) have the same handler structure
const statsPage = ( url, controller ) => {
	page( url, controller );
};

export default function () {
	console.log( 'registering stats routes' );
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

	// Redirect this to default /stats/day view in order to keep
	// the paths and page view reporting consistent.
	page( '/stats', '/stats/day' );

	// Stat Overview Page
	statsPage( `/stats/:period(${ validPeriods })`, overview );

	// statsPage( '/stats/insights', sites );

	// Stat Insights Page
	statsPage( '/stats/insights/:site', insights );

	// Stat Site Pages
	statsPage( `/stats/:period(${ validPeriods })/:site`, site );

	// Redirect this to default /stats/day/:module/:site view to
	// keep the paths and page view reporting consistent.
	page( `/stats/:module(${ validModules })/:site`, redirectToDefaultModulePage );

	// Stat Summary Pages
	statsPage( `/stats/:period(${ validPeriods })/:module(${ validModules })/:site`, summary );

	// Stat Single Post Page
	statsPage( '/stats/post/:post_id/:site', post );
	statsPage( '/stats/page/:post_id/:site', post );

	// Stat Follows Page
	statsPage( '/stats/follows/comment/:site', follows );
	statsPage( '/stats/follows/comment/:page_num/:site', follows );

	page( '/stats/activity/:site?', redirectToActivity );

	statsPage( `/stats/ads/:period(${ validPeriods })/:site`, wordAds );

	// Anything else should redirect to default WordAds stats page
	page( '/stats/wordads/(.*)', redirectToDefaultWordAdsPeriod );
	page( '/stats/ads/(.*)', redirectToDefaultWordAdsPeriod );

	// Anything else should redirect to default stats page
	page( '/stats/(.*)', redirectToDefaultSitePage );
}
