import page, { type Callback } from '@automattic/calypso-router';
import {
	follows,
	insights,
	post,
	site,
	summary,
	wordAds,
	subscribers,
	redirectToActivity,
	redirectToDefaultModulePage,
	redirectToDefaultWordAdsPeriod,
	purchase,
	emailStats,
	emailSummary,
	redirectToDaySummary,
} from 'calypso/my-sites/stats/controller';
import config from './lib/config-api';
import { makeLayout, render as clientRender } from './page-middleware/layout';
import 'calypso/my-sites/stats/style.scss';

const statsPage = ( url: string, controller: Callback ) => {
	page( url, controller, makeLayout, clientRender );
};

const redirectToSiteTrafficPage = () => {
	page.redirect( `/stats/day/${ config( 'blog_id' ) }` );
};

export default function ( pageBase = '/' ) {
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

	page.base( pageBase );

	// Redirect this to default /stats/day view in order to keep
	// the paths and page view reporting consistent.
	page( '/', '/stats/day/:site' );

	// Stat Insights Page
	statsPage( '/stats/insights/:site', insights );

	// Stat Subscribers Page (do not confuse with people/subscribers/)
	statsPage( '/stats/subscribers/:site', subscribers );
	statsPage( `/stats/subscribers/:period(${ validPeriods })/:site`, subscribers );

	// Stat Site Pages
	statsPage( `/stats/:period(${ validTrafficPagePeriods })/:site`, site );

	// Redirect this to default /stats/day/:module/:site view to
	// keep the paths and page view reporting consistent.
	statsPage( `/stats/:module(${ validModules })/:site`, redirectToDefaultModulePage );

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

	statsPage( '/stats/activity/:site?', redirectToActivity );

	statsPage( `/stats/ads/:period(${ validPeriods })/:site`, wordAds );

	// Anything else should redirect to default WordAds stats page
	statsPage( '/stats/wordads/(.*)', redirectToDefaultWordAdsPeriod );
	statsPage( '/stats/ads/(.*)', redirectToDefaultWordAdsPeriod );

	// Stat Purchase Page
	statsPage( '/stats/purchase/:site', purchase );

	// Email stats Pages
	statsPage( `/stats/email/:statType/:period(${ validEmailPeriods })/:email_id/:site`, emailStats );
	statsPage( '/stats/day/emails/:site', emailSummary );

	// Anything else should redirect to default stats page
	statsPage( '*', redirectToSiteTrafficPage );

	// Enable hashbang for routing in Jetpack.
	page( { hashbang: true } );
}
