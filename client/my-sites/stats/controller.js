/**
 * External Dependencies
 */
import React from 'react';
import page from 'page';
import i18n from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal Dependencies
 */
import config from 'config';
import userFactory from 'lib/user';
import sitesFactory from 'lib/sites-list';
import route from 'lib/route';
import analytics from 'lib/analytics';
import titlecase from 'to-title-case';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { renderWithReduxStore } from 'lib/react-helpers';
import { savePreference } from 'state/preferences/actions';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';
import GraphProvider from 'lib/graph/GraphProvider';
import createGraph from 'lib/graph';
import GraphiQL from 'lib/graph/GraphiQL';

const user = userFactory();
const sites = sitesFactory();
const analyticsPageTitle = 'Stats';

function rangeOfPeriod( period, date ) {
	const periodRange = {
		period: period,
		startOf: date.clone().startOf( period ),
		endOf: date.clone().endOf( period )
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
	const durationAgo = i18n.moment.duration( endOfCurrentPeriod.diff( date ) );
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
	const filters = [
		{ title: i18n.translate( 'Insights' ), path: '/stats/insights/' + siteId, id: 'stats-insights' },
		{ title: i18n.translate( 'Days' ), path: '/stats/day/' + siteId, id: 'stats-day', period: 'day' },
		{ title: i18n.translate( 'Weeks' ), path: '/stats/week/' + siteId, id: 'stats-week', period: 'week' },
		{ title: i18n.translate( 'Months' ), path: '/stats/month/' + siteId, id: 'stats-month', period: 'month' },
		{ title: i18n.translate( 'Years' ), path: '/stats/year/' + siteId, id: 'stats-year', period: 'year' }
	];

	return filters;
}

module.exports = {
	resetFirstView( context ) {
		context.store.dispatch( savePreference( 'firstViewHistory', [] ) );
	},

	redirectToDefaultSitePage: function( context, next ) {
		const siteFragment = route.getSiteFragment( context.path );

		if ( siteFragment ) {
			// if we are redirecting we need to retain our intended layout-focus
			const currentLayoutFocus = getCurrentLayoutFocus( context.store.getState() );
			context.store.dispatch( setNextLayoutFocus( currentLayoutFocus ) );
			page.redirect( route.getStatsDefaultSitePage( siteFragment ) );
		} else {
			next();
		}
	},

	graph: function( context ) {
		const graph = createGraph( context.store );
		renderWithReduxStore(
			React.createElement( GraphProvider, { graph },
				React.createElement( GraphiQL )
			),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	insights: function( context, next ) {
		const Insights = require( 'my-sites/stats/stats-insights' );
		const StatsList = require( 'lib/stats/stats-list' );
		const FollowList = require( 'lib/follow-list' );
		let siteId = context.params.site_id;
		const basePath = route.sectionify( context.path );
		const followList = new FollowList();
		let summaryDate;
		const summarySites = [];
		let momentSiteZone = i18n.moment();
		const StatsComponent = Insights;

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Stats', { textOnly: true } ) ) );

		let site = sites.getSite( siteId );
		if ( ! site ) {
			site = sites.getSite( parseInt( siteId, 10 ) );
		}
		siteId = site ? ( site.ID || 0 ) : 0;

		// Check for a siteId and sites
		if ( 0 === siteId ) {
			if ( 0 === sites.data.length ) {
				sites.once( 'change', function() {
					page( context.path );
				} );
			} else {
				// site is not in the user's site list
				next();
			}
		}

		if ( site && site.options && typeof site.options.gmt_offset !== 'undefined' ) {
			momentSiteZone = i18n.moment().utcOffset( site.options.gmt_offset );
			summaryDate = momentSiteZone.format( 'YYYY-MM-DD' );
			summarySites.push( { ID: siteId, date: summaryDate } );
		}

		const siteDomain = ( site && ( typeof site.slug !== 'undefined' ) )
			? site.slug : route.getSiteFragment( context.path );

		const commentsList = new StatsList( { siteID: siteId, statType: 'statsComments', domain: siteDomain } );
		const tagsList = new StatsList( { siteID: siteId, statType: 'statsTags', domain: siteDomain } );
		const wpcomFollowersList = new StatsList( {
			siteID: siteId, statType: 'statsFollowers', type: 'wpcom', domain: siteDomain, max: 7 } );
		const emailFollowersList = new StatsList( {
			siteID: siteId, statType: 'statsFollowers', type: 'email', domain: siteDomain, max: 7 } );
		const commentFollowersList = new StatsList( {
			siteID: siteId, statType: 'statsCommentFollowers', domain: siteDomain, max: 7 } );

		analytics.pageView.record( basePath, analyticsPageTitle + ' > Insights' );

		const graph = createGraph( context.store );
		renderWithReduxStore(
			React.createElement( GraphProvider, { graph },
				React.createElement( StatsComponent, {
					site: site,
					followList: followList,
					commentsList: commentsList,
					tagsList: tagsList,
					wpcomFollowersList: wpcomFollowersList,
					emailFollowersList: emailFollowersList,
					commentFollowersList: commentFollowersList,
					summaryDate: summaryDate
				} )
			),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	overview: function( context, next ) {
		const StatsComponent = require( './overview' );
		const filters = function() {
			return [
				{ title: i18n.translate( 'Days' ), path: '/stats/day', altPaths: [ '/stats' ], id: 'stats-day', period: 'day' },
				{ title: i18n.translate( 'Weeks' ), path: '/stats/week', id: 'stats-week', period: 'week' },
				{ title: i18n.translate( 'Months' ), path: '/stats/month', id: 'stats-month', period: 'month' },
				{ title: i18n.translate( 'Years' ), path: '/stats/year', id: 'stats-year', period: 'year' }
			];
		};
		const basePath = route.sectionify( context.path );

		window.scrollTo( 0, 0 );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Stats', { textOnly: true } ) ) );

		const activeFilter = find( filters(), ( filter ) => {
			return context.pathname === filter.path || ( filter.altPaths && -1 !== filter.altPaths.indexOf( context.pathname ) );
		} );

		// Validate that date filter is legit
		if ( ! activeFilter ) {
			next();
		} else {
			analytics.mc.bumpStat( 'calypso_stats_overview_period', activeFilter.period );
			analytics.pageView.record( basePath, analyticsPageTitle + ' > ' + titlecase( activeFilter.period ) );

			renderWithReduxStore(
				React.createElement( StatsComponent, {
					period: activeFilter.period,
					sites: sites,
					path: context.pathname,
					user: user
				} ),
				document.getElementById( 'primary' ),
				context.store
			);
		}
	},

	site: function( context, next ) {
		let siteId = context.params.site_id;
		const siteFragment = route.getSiteFragment( context.path );
		const queryOptions = context.query;
		const FollowList = require( 'lib/follow-list' );
		const SiteStatsComponent = require( 'my-sites/stats/site' );
		const StatsList = require( 'lib/stats/stats-list' );
		const filters = getSiteFilters.bind( null, siteId );
		let date;
		const charts = function() {
			return [
				{ attr: 'views', legendOptions: [ 'visitors' ], gridicon: 'visible',
					label: i18n.translate( 'Views', { context: 'noun' } ) },
				{ attr: 'visitors', gridicon: 'user', label: i18n.translate( 'Visitors', { context: 'noun' } ) },
				{ attr: 'likes', gridicon: 'star', label: i18n.translate( 'Likes', { context: 'noun' } ) },
				{ attr: 'comments', gridicon: 'comment', label: i18n.translate( 'Comments', { context: 'noun' } ) }
			];
		};
		let chartDate;
		let chartTab;
		let visitsListFields;
		let endDate;
		let chartEndDate;
		let period;
		let chartPeriod;
		let siteOffset = 0;
		let momentSiteZone = i18n.moment();
		let numPeriodAgo = 0;
		const basePath = route.sectionify( context.path );
		let baseAnalyticsPath;
		let chartQuantity = 10;
		let siteComponent;

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Stats', { textOnly: true } ) ) );

		let currentSite = sites.getSite( siteId );
		if ( ! currentSite ) {
			currentSite = sites.getSite( parseInt( siteId, 10 ) );
		}
		siteId = currentSite ? ( currentSite.ID || 0 ) : 0;

		const activeFilter = find( filters(), ( filter ) => {
			return context.pathname === filter.path || ( filter.altPaths && -1 !== filter.altPaths.indexOf( context.pathname ) );
		} );

		if ( ! siteFragment || ! activeFilter ) {
			next();
		} else {
			if ( 0 === siteId ) {
				if ( 0 === sites.data.length ) {
					sites.once( 'change', function() {
						page( context.path );
					} );
				} else {
					next();
				}
			}

			if ( currentSite && currentSite.domain ) {
				// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
				context.store.dispatch( setTitle( i18n.translate( 'Stats', { textOnly: true } ) ) );
			}

			if ( currentSite && 'object' === typeof currentSite.options && 'undefined' !== typeof currentSite.options.gmt_offset ) {
				siteOffset = currentSite.options.gmt_offset;
			}
			momentSiteZone = i18n.moment().utcOffset( siteOffset );
			chartDate = rangeOfPeriod( activeFilter.period, momentSiteZone.clone().locale( 'en' ) ).endOf;
			if ( queryOptions.startDate && i18n.moment( queryOptions.startDate ).isValid ) {
				date = i18n.moment( queryOptions.startDate ).locale( 'en' );
				numPeriodAgo = getNumPeriodAgo( momentSiteZone, date, activeFilter.period );
			} else {
				date = rangeOfPeriod( activeFilter.period, momentSiteZone.clone().locale( 'en' ) ).startOf;
			}

			numPeriodAgo = parseInt( numPeriodAgo, 10 );
			if ( numPeriodAgo ) {
				if ( numPeriodAgo > 9 ) {
					numPeriodAgo = '10plus';
				}
				numPeriodAgo = '-' + numPeriodAgo;
			} else {
				numPeriodAgo = '';
			}

			baseAnalyticsPath = basePath + '/:site';

			analytics.mc.bumpStat( 'calypso_stats_site_period', activeFilter.period + numPeriodAgo );
			analytics.pageView.record( baseAnalyticsPath, analyticsPageTitle + ' > ' + titlecase( activeFilter.period ) );

			period = rangeOfPeriod( activeFilter.period, date );
			chartPeriod = rangeOfPeriod( activeFilter.period, chartDate );
			endDate = period.endOf.format( 'YYYY-MM-DD' );
			chartEndDate = chartPeriod.endOf.format( 'YYYY-MM-DD' );

			chartTab = queryOptions.tab || 'views';
			visitsListFields = chartTab;
			// If we are on the default Tab, grab visitors too
			if ( 'views' === visitsListFields ) {
				visitsListFields = 'views,visitors';
			}

			switch ( activeFilter.period ) {
				case 'day':
					chartQuantity = 30;
					break;
				case 'month':
					chartQuantity = 12;
					break;
				case 'week':
					chartQuantity = 13;
					break;
				case 'year':
					break;
				default:
					chartQuantity = 10;
					break;
			}

			const siteDomain = ( currentSite && ( typeof currentSite.slug !== 'undefined' ) )
					? currentSite.slug : siteFragment;

			const followList = new FollowList();
			const activeTabVisitsList = new StatsList( {
				siteID: siteId, statType: 'statsVisits', unit: activeFilter.period,
				quantity: chartQuantity, date: chartEndDate, stat_fields: visitsListFields, domain: siteDomain } );
			const visitsList = new StatsList( {
				siteID: siteId, statType: 'statsVisits', unit: activeFilter.period,
				quantity: chartQuantity, date: chartEndDate,
				stat_fields: 'views,visitors,likes,comments,post_titles', domain: siteDomain } );
			const postsPagesList = new StatsList( {
				siteID: siteId, statType: 'statsTopPosts', period: activeFilter.period, date: endDate, domain: siteDomain } );
			const referrersList = new StatsList( {
				siteID: siteId, statType: 'statsReferrers', period: activeFilter.period, date: endDate, domain: siteDomain } );
			const clicksList = new StatsList( {
				siteID: siteId, statType: 'statsClicks', period: activeFilter.period, date: endDate, domain: siteDomain } );
			const authorsList = new StatsList( {
				siteID: siteId, statType: 'statsTopAuthors', period: activeFilter.period, date: endDate, domain: siteDomain } );
			const countriesList = new StatsList( {
				siteID: siteId, statType: 'statsCountryViews', period: activeFilter.period, date: endDate, domain: siteDomain } );
			const videoPlaysList = new StatsList( {
				siteID: siteId, statType: 'statsVideoPlays', period: activeFilter.period, date: endDate, domain: siteDomain } );
			const searchTermsList = new StatsList( {
				siteID: siteId, statType: 'statsSearchTerms', period: activeFilter.period, date: endDate, domain: siteDomain } );
			const tagsList = new StatsList( { siteID: siteId, statType: 'statsTags', domain: siteDomain } );
			const commentsList = new StatsList( { siteID: siteId, statType: 'statsComments', domain: siteDomain } );
			const wpcomFollowersList = new StatsList( {
				siteID: siteId, statType: 'statsFollowers', type: 'wpcom', domain: siteDomain, max: 7 } );
			const emailFollowersList = new StatsList( {
				siteID: siteId, statType: 'statsFollowers', type: 'email', domain: siteDomain, max: 7 } );
			const commentFollowersList = new StatsList( {
				siteID: siteId, statType: 'statsCommentFollowers', domain: siteDomain, max: 7 } );

			siteComponent = SiteStatsComponent;
			const siteComponentChildren = {
				date,
				charts,
				chartDate,
				chartTab,
				context,
				sites,
				activeTabVisitsList,
				visitsList,
				postsPagesList,
				referrersList,
				clicksList,
				authorsList,
				countriesList,
				videoPlaysList,
				siteId,
				period,
				chartPeriod,
				tagsList,
				commentsList,
				wpcomFollowersList,
				emailFollowersList,
				commentFollowersList,
				followList,
				searchTermsList,
				slug: siteDomain,
				path: context.pathname,
			};

			if ( config.isEnabled( 'manage/stats/podcasts' ) ) {
				siteComponentChildren.podcastDownloadsList = new StatsList( {
					siteID: siteId,
					statType: 'statsPodcastDownloads',
					period: activeFilter.period,
					date: endDate,
					domain: siteDomain
				} );
			}

			renderWithReduxStore(
				React.createElement( siteComponent, siteComponentChildren ),
				document.getElementById( 'primary' ),
				context.store
			);
		}
	},

	summary: function( context, next ) {
		let siteId = context.params.site_id;
		const siteFragment = route.getSiteFragment( context.path );
		const queryOptions = context.query;
		const StatsList = require( 'lib/stats/stats-list' );
		const FollowList = require( 'lib/follow-list' );
		const StatsSummaryComponent = require( 'my-sites/stats/summary' );
		const filters = function( contextModule, _siteId ) {
			return [
				{ title: i18n.translate( 'Days' ), path: '/stats/' + contextModule + '/' + _siteId,
					altPaths: [ '/stats/day/' + contextModule + '/' + _siteId ], id: 'stats-day',
						period: 'day', back: '/stats/' + _siteId },
				{ title: i18n.translate( 'Weeks' ), path: '/stats/week/' + contextModule + '/' + _siteId,
					id: 'stats-week', period: 'week', back: '/stats/week/' + _siteId },
				{ title: i18n.translate( 'Months' ), path: '/stats/month/' + contextModule + '/' + _siteId,
					id: 'stats-month', period: 'month', back: '/stats/month/' + _siteId },
				{ title: i18n.translate( 'Years' ), path: '/stats/year/' + contextModule + '/' + _siteId,
					id: 'stats-year', period: 'year', back: '/stats/year/' + _siteId }
			];
		}.bind( null, context.params.module, siteId );
		let date;
		let endDate;
		let period;
		let summaryList;
		let visitsList;
		const followList = new FollowList();
		const validModules = [ 'posts', 'referrers', 'clicks', 'countryviews', 'authors', 'videoplays', 'videodetails', 'podcastdownloads', 'searchterms' ];
		let momentSiteZone = i18n.moment();
		const basePath = route.sectionify( context.path );

		let site = sites.getSite( siteId );
		if ( ! site ) {
			site = sites.getSite( parseInt( siteId, 10 ) );
		}
		siteId = site ? ( site.ID || 0 ) : 0;

		const activeFilter = find( filters(), ( filter ) => {
			return context.pathname === filter.path || ( filter.altPaths && -1 !== filter.altPaths.indexOf( context.pathname ) );
		} );

		// if we have a siteFragment, but no siteId, wait for the sites list
		if ( siteFragment && 0 === siteId ) {
			if ( 0 === sites.data.length ) {
				sites.once( 'change', function() {
					page( context.path );
				} );
			} else {
				// site is not in the user's site list
				window.location = '/stats';
			}
		} else if ( ! activeFilter || -1 === validModules.indexOf( context.params.module ) ) {
			next();
		} else {
			if ( 'object' === typeof( site.options ) && 'undefined' !== typeof( site.options.gmt_offset ) ) {
				momentSiteZone = i18n.moment().utcOffset( site.options.gmt_offset );
			}
			if ( queryOptions.startDate && i18n.moment( queryOptions.startDate ).isValid ) {
				date = i18n.moment( queryOptions.startDate );
			} else {
				date = momentSiteZone.endOf( activeFilter.period );
			}
			period = rangeOfPeriod( activeFilter.period, date );
			endDate = period.endOf.format( 'YYYY-MM-DD' );

			const siteDomain = ( site && ( typeof site.slug !== 'undefined' ) )
				? site.slug : siteFragment;

			switch ( context.params.module ) {

				case 'posts':
					visitsList = new StatsList( {
						statType: 'statsVisits', unit: activeFilter.period, siteID: siteId,
						quantity: 10, date: endDate, domain: siteDomain } );
					summaryList = new StatsList( { statType: 'statsTopPosts', siteID: siteId,
						period: activeFilter.period, date: endDate, max: 0, domain: siteDomain } );
					break;

				case 'referrers':
					summaryList = new StatsList( {
						siteID: siteId, statType: 'statsReferrers', period: activeFilter.period,
						date: endDate, max: 0, domain: siteDomain } );
					break;

				case 'clicks':
					summaryList = new StatsList( {
						statType: 'statsClicks', siteID: siteId, period: activeFilter.period,
						date: endDate, max: 0, domain: siteDomain } );
					break;

				case 'countryviews':
					summaryList = new StatsList( {
						siteID: siteId, statType: 'statsCountryViews', period: activeFilter.period,
						date: endDate, max: 0, domain: siteDomain } );
					break;

				case 'authors':
					summaryList = new StatsList( {
						statType: 'statsTopAuthors', siteID: siteId, period: activeFilter.period,
						date: endDate, max: 0, domain: siteDomain } );
					break;

				case 'videoplays':
					summaryList = new StatsList( { statType: 'statsVideoPlays', siteID: siteId,
						period: activeFilter.period, date: endDate, max: 0, domain: siteDomain } );
					break;

				case 'videodetails':
					summaryList = new StatsList( { statType: 'statsVideo', post: queryOptions.post,
						siteID: siteId, period: activeFilter.period, date: endDate, max: 0, domain: siteDomain } );
					break;

				case 'searchterms':
					summaryList = new StatsList( { siteID: siteId, statType: 'statsSearchTerms',
						period: activeFilter.period, date: endDate, max: 0, domain: siteDomain } );
					break;

				case 'podcastdownloads':
					summaryList = new StatsList( { statType: 'statsPodcastDownloads', siteID: siteId,
						period: activeFilter.period, date: endDate, max: 0, domain: siteDomain } );
					break;
			}

			analytics.pageView.record(
				basePath,
				analyticsPageTitle + ' > ' + titlecase( activeFilter.period ) + ' > ' + titlecase( context.params.module )
			);

			renderWithReduxStore(
				React.createElement( StatsSummaryComponent, {
					date: date,
					context: context,
					path: context.pathname,
					sites: sites,
					filters: filters,
					summaryList: summaryList,
					visitsList: visitsList,
					followList: followList,
					siteId: siteId,
					period: period
				} ),
				document.getElementById( 'primary' ),
				context.store
			);
		}
	},

	post: function( context ) {
		let siteId = context.params.site_id;
		const postId = parseInt( context.params.post_id, 10 );
		const StatsPostComponent = require( 'my-sites/stats/stats-post-detail' );
		const StatsList = require( 'lib/stats/stats-list' );
		const pathParts = context.path.split( '/' );
		const postOrPage = pathParts[ 2 ] === 'post' ? 'post' : 'page';
		let postViewsList;

		let site = sites.getSite( siteId );
		if ( ! site ) {
			site = sites.getSite( parseInt( siteId, 10 ) );
		}
		siteId = site ? ( site.ID || 0 ) : 0;

		if ( 0 === siteId ) {
			if ( 0 === sites.data.length ) {
				sites.once( 'change', function() {
					page( context.path );
				} );
			} else {
				// site is not in the user's site list
				window.location = '/stats';
			}
		} else {
			const siteDomain = ( site && ( typeof site.slug !== 'undefined' ) )
				? site.slug : route.getSiteFragment( context.path );

			postViewsList = new StatsList( { statType: 'statsPostViews', siteID: siteId, post: postId, domain: siteDomain } );

			analytics.pageView.record( '/stats/' + postOrPage + '/:post_id/:site',
				analyticsPageTitle + ' > Single ' + titlecase( postOrPage ) );

			renderWithReduxStore(
				React.createElement( StatsPostComponent, {
					siteId: siteId,
					postId: postId,
					sites: sites,
					context: context,
					path: context.path,
					postViewsList: postViewsList
				} ),
				document.getElementById( 'primary' ),
				context.store
			);
		}
	},

	follows: function( context, next ) {
		let siteId = context.params.site_id;
		const FollowList = require( 'lib/follow-list' );
		const FollowsComponent = require( 'my-sites/stats/follows' );
		const StatsList = require( 'lib/stats/stats-list' );
		const validFollowTypes = [ 'wpcom', 'email', 'comment' ];
		const followType = context.params.follow_type;
		let pageNum = context.params.page_num;
		const followList = new FollowList();
		let followersList;
		const basePath = route.sectionify( context.path );

		let site = sites.getSite( siteId );
		if ( ! site ) {
			site = sites.getSite( parseInt( siteId, 10 ) );
		}
		siteId = site ? ( site.ID || 0 ) : 0;

		const siteDomain = ( site && ( typeof site.slug !== 'undefined' ) )
			? site.slug : route.getSiteFragment( context.path );

		if ( -1 === validFollowTypes.indexOf( followType ) ) {
			next();
		} else if ( 0 === siteId ) {
			if ( 0 === sites.data.length ) {
				sites.once( 'change', function() {
					page( context.path );
				} );
			} else {
				// site is not in the user's site list
				window.location = '/stats';
			}
		} else {
			pageNum = parseInt( pageNum, 10 );

			if ( ! pageNum || pageNum < 1 ) {
				pageNum = 1;
			}

			switch ( followType ) {
				case 'comment':
					followersList = new StatsList( {
						siteID: siteId, statType: 'statsCommentFollowers', domain: siteDomain, max: 20, page: pageNum } );
					break;

				case 'email':
				case 'wpcom':
					followersList = new StatsList( {
						siteID: siteId, statType: 'statsFollowers', domain: siteDomain, max: 20, page: pageNum, type: followType } );
					break;
			}

			analytics.pageView.record(
				basePath.replace( '/' + pageNum, '' ),
				analyticsPageTitle + ' > Followers > ' + titlecase( followType )
			);

			renderWithReduxStore(
				React.createElement( FollowsComponent, {
					path: context.path,
					sites: sites,
					siteId: siteId,
					page: pageNum,
					perPage: 20,
					total: 10,
					followersList: followersList,
					followType: followType,
					followList: followList,
					domain: siteDomain
				} ),
				document.getElementById( 'primary' ),
				context.store
			);
		}
	}
};
