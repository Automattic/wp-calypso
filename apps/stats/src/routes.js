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
	page( url, controller, makeLayout, clientRender );
};

export default function () {
	const validPeriods = [ 'day', 'week', 'month', 'year' ].join( '|' );

	// const validModules = [
	// 	'posts',
	// 	'referrers',
	// 	'clicks',
	// 	'countryviews',
	// 	'authors',
	// 	'videoplays',
	// 	'videodetails',
	// 	'filedownloads',
	// 	'searchterms',
	// 	'annualstats',
	// ].join( '|' );

	// Redirect this to default /stats/day view in order to keep
	// the paths and page view reporting consistent.
	page( '/stats', '/stats/day' );
	// page( '/stats/day', function () {
	// 	console.log( 'working' );
	// 	document.body.textContent = 'It works';
	// } );

	// Stat Overview Page
	statsPage( `/stats/:period(${ validPeriods })`, overview );

	page( `/stats/test`, () => ( document.body.textContent = 'It works' ) );

	// page( '/stats/insights', sites );

	// Stat Insights Page
	// page( '/stats/insights/:site', insights );

	// // Stat Site Pages
	// page( `/stats/:period(${ validPeriods })/:site`, site );

	// // Redirect this to default /stats/day/:module/:site view to
	// // keep the paths and page view reporting consistent.
	// page( `/stats/:module(${ validModules })/:site`, redirectToDefaultModulePage );

	// // Stat Summary Pages
	// page( `/stats/:period(${ validPeriods })/:module(${ validModules })/:site`, summary );

	// // Stat Single Post Page
	// page( '/stats/post/:post_id/:site', post );
	// page( '/stats/page/:post_id/:site', post );

	// Stat Follows Page
	// page( '/stats/follows/comment/:site', follows );
	// page( '/stats/follows/comment/:page_num/:site', follows );

	// page( '/stats/activity/:site?', redirectToActivity );

	// page( `/stats/ads/:period(${ validPeriods })/:site`, wordAds );

	// Anything else should redirect to default WordAds stats page
	// page( '/stats/wordads/(.*)', redirectToDefaultWordAdsPeriod );
	// page( '/stats/ads/(.*)', redirectToDefaultWordAdsPeriod );

	// Anything else should redirect to default stats page
	// page( '/stats/(.*)', redirectToDefaultSitePage );
}
