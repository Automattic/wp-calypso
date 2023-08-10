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
	emailStats,
	emailSummary,
	subscribers,
	purchase,
} from './controller';

import './style.scss';

// all Stats pages (except redirects) have the same handler structure
const statsPage = ( url, controller ) => {
	page( url, siteSelection, navigation, controller, makeLayout, clientRender );
};

export default function () {
	const validPeriods = [ 'day', 'week', 'month', 'year' ].join( '|' );
	const validEmailPeriods = [ 'hour', 'day' ].join( '|' );

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

	statsPage( '/stats/insights', sites );

	// Stat Purchase Page
	statsPage( '/stats/purchase/:site', purchase );

	// Stat Insights Page
	statsPage( '/stats/insights/:site', insights );

	// Stat Subscribers Page (do not confuse with people/subscribers/)
	statsPage( '/stats/subscribers/:site', subscribers );
	statsPage( `/stats/subscribers/:period(${ validPeriods })/:site`, subscribers );

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

	// Email stats Pages
	statsPage( `/stats/email/:statType/:period(${ validEmailPeriods })/:email_id/:site`, emailStats );
	statsPage( `/stats/day/emails/:site`, emailSummary );

	// Anything else should redirect to default stats page
	page( '/stats/(.*)', redirectToDefaultSitePage );
}
