import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Spinner } from '@automattic/components';
import i18n from 'i18n-calypso';
import { find, pick } from 'lodash';
import moment from 'moment';
import AsyncLoad from 'calypso/components/async-load';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { getSiteFragment, getStatsDefaultSitePage } from 'calypso/lib/route';
import { getSite, getSiteOption } from 'calypso/state/sites/selectors';
import { setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import StatsSite from './site';
import StatsEmailDetail from './stats-email-detail';
import StatsEmailSummary from './stats-email-summary';
import LoadStatsPage from './stats-redirect/async-load-stats-page';

const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

const PageLoading = (
	<div
		style={ {
			minHeight: 'calc( 100vh - 100px )',
			width: '100%',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
		} }
	>
		{ isOdysseyStats ? (
			<img width="32" height="32" alt="Loading" src="//en.wordpress.com/i/loading/loading-64.gif" />
		) : (
			<Spinner />
		) }
	</div>
);

function rangeOfPeriod( period, date ) {
	const periodRange = {
		period: period,
		startOf: date.clone().startOf( period ),
		endOf: date.clone().endOf( period ),
	};

	if ( 'week' === period ) {
		if ( '0' === date.format( 'd' ) ) {
			periodRange.startOf.subtract( 6, 'd' );
			periodRange.endOf.subtract( 6, 'd' );
		} else {
			periodRange.startOf.add( 1, 'd' );
			periodRange.endOf.add( 1, 'd' );
		}
	}

	periodRange.key = period + ':' + periodRange.endOf.format( 'YYYY-MM-DD' );

	return periodRange;
}

function getNumPeriodAgo( momentSiteZone, date, period ) {
	const endOfCurrentPeriod = momentSiteZone.endOf( period );
	const durationAgo = moment.duration( endOfCurrentPeriod.diff( date ) );
	let numPeriodAgo;

	switch ( period ) {
		case 'day':
			numPeriodAgo = durationAgo.asDays();
			break;
		case 'week':
			numPeriodAgo = durationAgo.asWeeks();
			break;
		case 'month':
			numPeriodAgo = durationAgo.asMonths();
			break;
		case 'year':
			numPeriodAgo = durationAgo.asYears();
			break;
	}
	return numPeriodAgo;
}

function getSiteFilters( siteId ) {
	return [
		//TODO: This Insights route could be removed since it has been set routing as below.
		// statsPage( '/stats/insights/:site', insights );
		{
			title: i18n.translate( 'Insights' ),
			path: '/stats/insights/' + siteId,
			id: 'stats-insights',
		},
		{
			title: i18n.translate( 'Subscribers' ),
			path: '/stats/subscribers/' + siteId,
			id: 'stats-subscribers',
			period: 'day', // default period for Subscribers
		},
		{
			title: i18n.translate( 'Days' ),
			path: '/stats/subscribers/day/' + siteId,
			id: 'stats-subscribers-day',
			period: 'day',
		},
		{
			title: i18n.translate( 'Weeks' ),
			path: '/stats/subscribers/week/' + siteId,
			id: 'stats-subscribers-week',
			period: 'week',
		},
		{
			title: i18n.translate( 'Months' ),
			path: '/stats/subscribers/month/' + siteId,
			id: 'stats-subscribers-month',
			period: 'month',
		},
		{
			title: i18n.translate( 'Years' ),
			path: '/stats/subscribers/year/' + siteId,
			id: 'stats-subscribers-year',
			period: 'year',
		},
		{
			title: i18n.translate( 'Hours' ),
			path: '/stats/hour/' + siteId,
			id: 'stats-hour',
			period: 'hour',
		},
		{
			title: i18n.translate( 'Days' ),
			path: '/stats/day/' + siteId,
			id: 'stats-day',
			period: 'day',
		},
		{
			title: i18n.translate( 'Weeks' ),
			path: '/stats/week/' + siteId,
			id: 'stats-week',
			period: 'week',
		},
		{
			title: i18n.translate( 'Months' ),
			path: '/stats/month/' + siteId,
			id: 'stats-month',
			period: 'month',
		},
		{
			title: i18n.translate( 'Years' ),
			path: '/stats/year/' + siteId,
			id: 'stats-year',
			period: 'year',
		},
		{
			title: i18n.translate( 'Hours' ),
			path: `/stats/email/opens/hour/`,
			id: 'stats-email-opens-hour',
			period: 'hour',
		},
		{
			title: i18n.translate( 'Days' ),
			path: `/stats/email/opens/day/`,
			id: 'stats-email-opens-day',
			period: 'day',
		},
		{
			title: i18n.translate( 'Hours' ),
			path: `/stats/email/clicks/hour/`,
			id: 'stats-email-clicks-hour',
			period: 'hour',
		},
		{
			title: i18n.translate( 'Days' ),
			path: `/stats/email/clicks/day/`,
			id: 'stats-email-clicks-day',
			period: 'day',
		},
		{
			title: i18n.translate( 'Days' ),
			path: `/stats/day/emails`,
			id: 'stats-email-summary',
			period: 'day',
		},
	];
}

function getWordAdsFilters( siteId ) {
	return [
		{
			title: i18n.translate( 'WordAds - Days' ),
			path: '/stats/ads/day/' + siteId,
			period: 'day',
		},
		{
			title: i18n.translate( 'WordAds - Weeks' ),
			id: 'stats-wordads-week',
			period: 'week',
		},
		{
			title: i18n.translate( 'WordAds - Months' ),
			id: 'stats-wordads-month',
			period: 'month',
		},
		{
			title: i18n.translate( 'WordAds - Years' ),
			id: 'stats-wordads-year',
			period: 'year',
		},
	];
}

function getMomentSiteZone( state, siteId ) {
	const gmtOffset = getSiteOption( state, siteId, 'gmt_offset' );
	return moment().utcOffset( Number.isFinite( gmtOffset ) ? gmtOffset : 0 );
}

export function redirectToActivity( context ) {
	if ( context.params.site ) {
		page.redirect( '/activity-log/' + context.params.site );
	} else {
		page.redirect( '/activity-log' );
	}
}

export function redirectToDefaultSitePage( context ) {
	const siteFragment = getSiteFragment( context.path );

	// if we are redirecting we need to retain our intended layout-focus
	const currentLayoutFocus = getCurrentLayoutFocus( context.store.getState() );
	context.store.dispatch( setNextLayoutFocus( currentLayoutFocus ) );

	page.redirect( getStatsDefaultSitePage( siteFragment ) );
}

export function redirectToDefaultWordAdsPeriod( context ) {
	const siteFragment = getSiteFragment( context.path );

	// if we are redirecting we need to retain our intended layout-focus
	const currentLayoutFocus = getCurrentLayoutFocus( context.store.getState() );
	context.store.dispatch( setNextLayoutFocus( currentLayoutFocus ) );

	if ( siteFragment ) {
		page.redirect( `/stats/ads/day/${ siteFragment }` );
	} else {
		page.redirect( getStatsDefaultSitePage() );
	}
}

export function redirectToDefaultModulePage( context ) {
	page.redirect( `/stats/day/${ context.params.module }/${ context.params.site }` );
}

export function insights( context, next ) {
	context.primary = (
		<LoadStatsPage>
			<AsyncLoad require="calypso/my-sites/stats/stats-insights" placeholder={ PageLoading } />
		</LoadStatsPage>
	);
	next();
}

export function subscribers( context, next ) {
	const givenSiteId = context.params.site;
	const filters = getSiteFilters( givenSiteId );
	const activeFilter = find( filters, ( filter ) => {
		return (
			context.path.indexOf( filter.path ) >= 0 ||
			( filter.altPaths && context.path.indexOf( filter.altPaths ) >= 0 )
		);
	} );

	// moment and rangeOfPeriod format needed for summary page link for email mdule
	const date = moment().locale( 'en' );

	context.primary = (
		<LoadStatsPage>
			<AsyncLoad
				require="calypso/my-sites/stats/stats-subscribers"
				placeholder={ PageLoading }
				period={ rangeOfPeriod( activeFilter.period, date ) }
			/>
		</LoadStatsPage>
	);
	next();
}

export function overview( context, next ) {
	const filters = function () {
		return [
			{
				title: i18n.translate( 'Days' ),
				path: '/stats/day',
				id: 'stats-day',
				period: 'day',
			},
			{ title: i18n.translate( 'Weeks' ), path: '/stats/week', id: 'stats-week', period: 'week' },
			{
				title: i18n.translate( 'Months' ),
				path: '/stats/month',
				id: 'stats-month',
				period: 'month',
			},
			{ title: i18n.translate( 'Years' ), path: '/stats/year', id: 'stats-year', period: 'year' },
		];
	};

	window.scrollTo( 0, 0 );

	const activeFilter = find( filters(), ( filter ) => {
		return context.params.period === filter.period || context.path.includes( filter.path );
	} );

	// Validate that date filter is legit
	if ( ! activeFilter ) {
		return next();
	}

	bumpStat( 'calypso_stats_overview_period', activeFilter.period );

	context.primary = (
		<LoadStatsPage>
			<AsyncLoad
				require="calypso/my-sites/stats/overview"
				placeholder={ PageLoading }
				period={ activeFilter.period }
				path={ context.pathname }
			/>
		</LoadStatsPage>
	);
	next();
}

export function site( context, next ) {
	const {
		params: { site: givenSiteId },
		query: queryOptions,
		store,
	} = context;

	const filters = getSiteFilters( givenSiteId );
	const state = store.getState();

	// Why empty??
	const currentSite = getSite( state, givenSiteId );
	const siteId = currentSite ? currentSite.ID || 0 : 0;

	const activeFilter = find( filters, ( filter ) => {
		return context.path.includes( filter.path );
	} );

	if ( ! activeFilter ) {
		return next();
	}

	const momentSiteZone = getMomentSiteZone( state, siteId );
	const isValidStartDate = queryOptions.startDate && moment( queryOptions.startDate ).isValid();

	const date = isValidStartDate
		? moment( queryOptions.startDate ).locale( 'en' )
		: rangeOfPeriod( activeFilter.period, momentSiteZone.locale( 'en' ) ).startOf;

	const parsedPeriod = isValidStartDate
		? parseInt( getNumPeriodAgo( momentSiteZone, date, activeFilter.period ), 10 )
		: 0;

	// eslint-disable-next-line no-nested-ternary
	const numPeriodAgo = parsedPeriod ? ( parsedPeriod > 9 ? '10plus' : '-' + parsedPeriod ) : '';

	bumpStat( 'calypso_stats_site_period', activeFilter.period + numPeriodAgo );

	const validTabs = [ 'views', 'visitors', 'likes', 'comments' ];
	const chartTab = validTabs.includes( queryOptions.tab ) ? queryOptions.tab : 'views';

	context.primary = (
		<LoadStatsPage>
			<StatsSite
				path={ context.pathname }
				date={ date }
				chartTab={ chartTab }
				context={ context }
				period={ rangeOfPeriod( activeFilter.period, date ) }
			/>
		</LoadStatsPage>
	);

	next();
}

export function summary( context, next ) {
	let siteId = context.params.site;
	const siteFragment = getSiteFragment( context.path );
	const queryOptions = context.query;
	const contextModule = context.params.module;
	const filters = [
		{
			path: '/stats/day/' + contextModule + '/' + siteId,
			id: 'stats-day',
			period: 'day',
		},
		{ path: '/stats/week/' + contextModule + '/' + siteId, id: 'stats-week', period: 'week' },
		{ path: '/stats/month/' + contextModule + '/' + siteId, id: 'stats-month', period: 'month' },
		{ path: '/stats/year/' + contextModule + '/' + siteId, id: 'stats-year', period: 'year' },
	];

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
	let momentSiteZone = moment();

	const selectedSite = getSite( context.store.getState(), siteId );
	siteId = selectedSite ? selectedSite.ID || 0 : 0;

	const activeFilter = find( filters, ( filter ) => {
		return context.path.includes( filter.path );
	} );

	if ( siteFragment && 0 === siteId ) {
		// site is not in the user's site list
		return ( window.location = '/stats' );
	}

	if ( ! activeFilter || ! validModules.includes( context.params.module ) ) {
		return next();
	}

	const gmtOffset = getSiteOption( context.store.getState(), siteId, 'gmt_offset' );
	if ( Number.isFinite( gmtOffset ) ) {
		momentSiteZone = moment().utcOffset( gmtOffset );
	}
	const isValidStartDate = queryOptions.startDate && moment( queryOptions.startDate ).isValid();
	const date = isValidStartDate
		? moment( queryOptions.startDate ).locale( 'en' )
		: momentSiteZone.endOf( activeFilter.period ).locale( 'en' );
	const period = rangeOfPeriod( activeFilter.period, date );

	const extraProps =
		context.params.module === 'videodetails' ? { postId: parseInt( queryOptions.post, 10 ) } : {};

	let statsQueryOptions = {};

	// All Time Summary Support
	if ( queryOptions.summarize && queryOptions.num ) {
		statsQueryOptions = pick( queryOptions, [ 'num', 'summarize' ] );
		statsQueryOptions.period = 'day';
	}

	context.primary = (
		<LoadStatsPage>
			<AsyncLoad
				require="calypso/my-sites/stats/summary"
				placeholder={ PageLoading }
				path={ context.pathname }
				statsQueryOptions={ statsQueryOptions }
				date={ date }
				context={ context }
				period={ period }
				{ ...extraProps }
			/>
		</LoadStatsPage>
	);

	next();
}

export function post( context, next ) {
	let siteId = context.params.site;
	const postId = parseInt( context.params.post_id, 10 );
	const selectedSite = getSite( context.store.getState(), siteId );
	siteId = selectedSite ? selectedSite.ID || 0 : 0;

	if ( 0 === siteId ) {
		window.location = '/stats';
		return next();
	}

	context.primary = (
		<LoadStatsPage>
			<AsyncLoad
				require="calypso/my-sites/stats/stats-post-detail"
				placeholder={ PageLoading }
				path={ context.path }
				postId={ postId }
				context={ context }
			/>
		</LoadStatsPage>
	);

	next();
}

export function follows( context, next ) {
	let siteId = context.params.site;
	let pageNum = context.params.page_num;

	const selectedSite = getSite( context.store.getState(), siteId );
	siteId = selectedSite ? selectedSite.ID || 0 : 0;

	const siteDomain =
		selectedSite && typeof selectedSite.slug !== 'undefined'
			? selectedSite.slug
			: getSiteFragment( context.path );

	if ( 0 === siteId ) {
		window.location = '/stats';
		return next();
	}

	pageNum = parseInt( pageNum, 10 );

	if ( ! pageNum || pageNum < 1 ) {
		pageNum = 1;
	}

	context.primary = (
		<LoadStatsPage>
			<AsyncLoad
				require="calypso/my-sites/stats/comment-follows"
				placeholder={ PageLoading }
				path={ context.path }
				page={ pageNum }
				perPage="20"
				total="10"
				domain={ siteDomain }
				siteId={ siteId }
			/>
		</LoadStatsPage>
	);

	next();
}

export function wordAds( context, next ) {
	const { query: queryOptions, store } = context;

	const state = store.getState();
	const siteId = getSelectedSiteId( state );
	const filters = getWordAdsFilters( siteId );

	const activeFilter = find( filters, ( filter ) => context.params.period === filter.period );

	if ( ! activeFilter ) {
		return next();
	}

	const momentSiteZone = getMomentSiteZone( state, siteId );
	const isValidStartDate = queryOptions.startDate && moment( queryOptions.startDate ).isValid();

	const date = isValidStartDate
		? moment( queryOptions.startDate ).locale( 'en' )
		: rangeOfPeriod( activeFilter.period, momentSiteZone.locale( 'en' ) ).startOf;

	const parsedPeriod = isValidStartDate
		? parseInt( getNumPeriodAgo( momentSiteZone, date, activeFilter.period ), 10 )
		: 0;

	// eslint-disable-next-line no-nested-ternary
	const numPeriodAgo = parsedPeriod ? ( parsedPeriod > 9 ? '10plus' : '-' + parsedPeriod ) : '';

	bumpStat( 'calypso_wordads_stats_site_period', activeFilter.period + numPeriodAgo );

	context.primary = (
		<LoadStatsPage>
			<AsyncLoad
				require="calypso/my-sites/stats/wordads"
				placeholder={ PageLoading }
				path={ context.pathname }
				date={ date }
				chartTab={ queryOptions.tab || 'impressions' }
				context={ context }
				period={ rangeOfPeriod( activeFilter.period, date ) }
			/>
		</LoadStatsPage>
	);

	next();
}

export function emailStats( context, next ) {
	const givenSiteId = context.params.site;
	const queryOptions = context.query;
	const state = context.store.getState();
	const statType = context.params.statType;
	const postId = parseInt( context.params.email_id, 10 );
	const selectedSite = getSite( context.store.getState(), givenSiteId );
	const siteId = selectedSite ? selectedSite.ID || 0 : 0;

	const momentSiteZone = getMomentSiteZone( state, siteId );
	const filters = getSiteFilters( givenSiteId );
	const activeFilter = find( filters, ( filter ) => {
		return (
			context.path.indexOf( filter.path ) >= 0 ||
			( filter.altPaths && context.path.indexOf( filter.altPaths ) >= 0 )
		);
	} );

	const isValidStartDate = queryOptions.startDate && moment( queryOptions.startDate ).isValid();

	const date = isValidStartDate
		? moment( queryOptions.startDate ).locale( 'en' )
		: rangeOfPeriod( activeFilter.period, momentSiteZone.locale( 'en' ) ).startOf;

	if ( 0 === siteId ) {
		window.location = '/stats';
		return next();
	}

	const validTabs = statType === 'opens' ? [ 'opens_count' ] : [ 'clicks_count' ];
	const chartTab = validTabs.includes( queryOptions.tab ) ? queryOptions.tab : validTabs[ 0 ];

	context.primary = (
		<LoadStatsPage>
			<StatsEmailDetail
				path={ context.path }
				postId={ postId }
				statType={ statType }
				chartTab={ chartTab }
				context={ context }
				givenSiteId={ givenSiteId }
				period={ rangeOfPeriod( activeFilter.period, date ) }
				date={ date }
				isValidStartDate={ isValidStartDate }
			/>
		</LoadStatsPage>
	);

	next();
}

export function emailSummary( context, next ) {
	const givenSiteId = context.params.site;

	const selectedSite = getSite( context.store.getState(), givenSiteId );
	const siteId = selectedSite ? selectedSite.ID || 0 : 0;

	if ( 0 === siteId ) {
		window.location = '/stats';
		return next();
	}

	const filters = getSiteFilters( givenSiteId );
	const activeFilter = find( filters, ( filter ) => {
		return (
			context.path.indexOf( filter.path ) >= 0 ||
			( filter.altPaths && context.path.indexOf( filter.altPaths ) >= 0 )
		);
	} );

	const date = moment().locale( 'en' );

	context.primary = (
		<LoadStatsPage>
			<StatsEmailSummary period={ rangeOfPeriod( activeFilter.period, date ) } />
		</LoadStatsPage>
	);

	next();
}

export function purchase( context, next ) {
	context.primary = (
		// DO NOT WRAP WITH <LoadStatsPage /> or you will get an infinite loop
		<AsyncLoad
			require="calypso/my-sites/stats/stats-purchase"
			placeholder={ PageLoading }
			query={ context.query }
		/>
	);
	next();
}
