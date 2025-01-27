import page, { type Callback, type Context } from '@automattic/calypso-router';
import { SiteDetails } from '@automattic/data-stores';
import wpcom from 'calypso/lib/wp';
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
import {
	SITE_REQUEST,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
	ODYSSEY_SITE_RECEIVE,
} from 'calypso/state/action-types';
import { getSite, isRequestingSite } from 'calypso/state/sites/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import config from './lib/config-api';
import { getApiNamespace, getApiPath } from './lib/get-api';
import { makeLayout, render as clientRender } from './page-middleware/layout';
import 'calypso/my-sites/stats/style.scss';

const siteSelection = ( context: Context, next: () => void ) => {
	const siteId = config( 'blog_id' );
	const dispatch = context.store.dispatch;
	const state = context.store.getState();

	dispatch( setSelectedSiteId( siteId ) );

	const isRequesting = isRequestingSite( state, siteId );
	const site = getSite( state, siteId );

	// If options stored on WPCOM exists or it's already requesting, we do not need to fetch it again.
	if ( ( site?.options && 'is_commercial' in site.options ) || isRequesting ) {
		next();
		return;
	}

	dispatch( { type: SITE_REQUEST, siteId: siteId } );
	wpcom.req
		.get(
			{
				path: getApiPath( '/site', { siteId } ),
				apiNamespace: getApiNamespace(),
			},
			{
				// Only add the http_envelope flag if it's a Simple Classic site.
				http_envelope: ! config.isEnabled( 'is_running_in_jetpack_site' ),
			}
		)
		.then( ( data: { data: string } | SiteDetails ) => {
			// For Jetpack/Atomic sites, data format is { data: JSON string of SiteDetails }
			if ( config.isEnabled( 'is_running_in_jetpack_site' ) && 'data' in data ) {
				return JSON.parse( data.data );
			}
			// For Simple sites, data is SiteDetails, so we directly pass it.
			return data;
		} )
		.then( ( site: SiteDetails ) => {
			dispatch( { type: ODYSSEY_SITE_RECEIVE, site } );
			dispatch( { type: SITE_REQUEST_SUCCESS, siteId } );
		} )
		.catch( () => {
			dispatch( { type: SITE_REQUEST_FAILURE, siteId } );
		} )
		.finally( next );
};

const statsPage = ( url: string, controller: Callback ) => {
	page( url, controller, siteSelection, makeLayout, clientRender );
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
	statsPage( `/stats/day/emails/:site`, emailSummary );

	// Anything else should redirect to default stats page
	statsPage( '*', redirectToSiteTrafficPage );

	// Enable hashbang for routing in Jetpack.
	page( { hashbang: true } );
}
