import page from '@automattic/calypso-router';
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
	redirectToDaySummary,
} from './controller';

import './style.scss';

// all Stats pages (except redirects) have the same handler structure
const statsPage = ( url, controller ) => {
	page( url, siteSelection, navigation, controller, makeLayout, clientRender );
};

export default function () {
	const validPeriods = [ 'day', 'week', 'month', 'year' ].join( '|' );
	const validTrafficPagePeriods = [ 'hour', 'day', 'week', 'month', 'year' ].join( '|' );
	const validEmailPeriods = [ 'hour', 'day' ].join( '|' );

	const validModules = [
		'posts',
		'referrers',
		'clicks',
		'countryviews',
		'locations',
		'authors',
		'videoplays',
		'videodetails',
		'filedownloads',
		'searchterms',
		'annualstats',
		'utm',
		'devices',
	].join( '|' );

	// Redirect this to default /stats/day view in order to keep
	// the paths and page view reporting consistent.
	page( '/stats', '/stats/day' );

	// Stat Overview Page
	statsPage( `/stats/:period(${ validPeriods })`, overview );

	// Stat Purchase Page
	statsPage( '/stats/purchase/:site?', purchase );

	// Stat Insights Page
	statsPage( '/stats/insights', sites );
	statsPage( '/stats/insights/:site', insights );

	// Stat Subscribers Page (do not confuse with people/subscribers/)
	statsPage( '/stats/subscribers/:site', subscribers );
	statsPage( `/stats/subscribers/:period(${ validPeriods })/:site`, subscribers );

	// Stat Site Pages
	statsPage( `/stats/:period(${ validTrafficPagePeriods })/:site`, site );

	// Redirect this to default /stats/day/:module/:site view to
	// keep the paths and page view reporting consistent.
	page( `/stats/:module(${ validModules })/:site`, redirectToDefaultModulePage );

	// Stat Summary Pages
	statsPage( `/stats/:period(${ validPeriods })/:module(${ validModules })/:site`, summary );
	// No hourly stats for modules
	statsPage( `/stats/hour/:module(${ validModules })/:site`, redirectToDaySummary );

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
