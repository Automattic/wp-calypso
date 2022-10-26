import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
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

const statsPage = ( url, controller ) => {
	page( url, controller, siteSelection, makeLayout, clientRender );
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

	// Redirect this to default /stats/day view in order to keep
	// the paths and page view reporting consistent.
	// page( '/', '/stats/day' );
	// page( '/stats/day', function () {
	// 	console.log( 'working' );
	// 	document.body.textContent = 'It works';
	// } );

	// Stat Overview Page
	statsPage( `/stats/:period(${ validPeriods })`, overview );

	statsPage( '/stats/insights', sites );

	// Stat Insights Page
	statsPage( '/stats/insights/:site', insights );

	// Stat Site Pages
	statsPage( `/stats/:period(${ validPeriods })/:site`, site );

	// Redirect this to default /stats/day/:module/:site view to
	// keep the paths and page view reporting consistent.
	statsPage( `/stats/:module(${ validModules })/:site`, redirectToDefaultModulePage );

	// Stat Summary Pages
	statsPage( `/stats/:period(${ validPeriods })/:module(${ validModules })/:site`, summary );

	// Stat Single Post Page
	statsPage( '/stats/post/:post_id/:site', post );
	statsPage( '/stats/page/:post_id/:site', post );

	// Stat Follows Page
	statsPage( '/stats/follows/comment/:site', follows );
	statsPage( '/stats/follows/comment/:page_num/:site', follows );

	statsPage( '/stats/activity/:site?', redirectToActivity );

	statsPage( `/stats/ads/:period(${ validPeriods })/:site`, wordAds );

	// Anything else should redirect to default WordAds stats page
	statsPage( '/stats/wordads/(.*)', redirectToDefaultWordAdsPeriod );
	statsPage( '/stats/ads/(.*)', redirectToDefaultWordAdsPeriod );

	// Anything else should redirect to default stats page
	statsPage( '/stats/(.*)', redirectToDefaultSitePage );
}
