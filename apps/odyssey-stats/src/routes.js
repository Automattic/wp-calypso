import config from '@automattic/calypso-config';
import page from 'page';
import {
	follows,
	insights,
	post,
	site,
	summary,
	wordAds,
	redirectToActivity,
	redirectToDefaultModulePage,
	redirectToDefaultWordAdsPeriod,
} from 'calypso/my-sites/stats/controller';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { makeLayout, render as clientRender } from './page-middleware/layout';

import 'calypso/my-sites/stats/style.scss';

const siteSelection = ( context, next ) => {
	context.store.dispatch( setSelectedSiteId( config( 'blog_id' ) ) );
	next( context, next );
};

const statsPage = ( url, controller ) => {
	page( url, controller, siteSelection, makeLayout, clientRender );
};

const redirectToSiteTrafficPage = () => {
	page.redirect( `/stats/day/${ config( 'blog_id' ) }` );
};

export default function ( pageBase = '/' ) {
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

	page.base( pageBase );

	// Redirect this to default /stats/day view in order to keep
	// the paths and page view reporting consistent.
	page( '/', '/stats/day/:site' );

	// Stat Insights Page
	statsPage( '/stats/insights/:site', insights );

	// TODO: insert subscribers

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
	statsPage( '*', redirectToSiteTrafficPage );

	// Enable hashbang for routing in Jetpack.
	page( { hashbang: true } );
}
