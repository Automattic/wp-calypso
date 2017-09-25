/**
 * External Dependencies
 */
import React from 'react';
import page from 'page';
import i18n from 'i18n-calypso';
import { find, pick } from 'lodash';

/**
 * Internal Dependencies
 */
import route from 'lib/route';
import analytics from 'lib/analytics';
import titlecase from 'to-title-case';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { renderWithReduxStore } from 'lib/react-helpers';
import { savePreference } from 'state/preferences/actions';
import { getSite, isJetpackSite, getSiteOption } from 'state/sites/selectors';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import AsyncLoad from 'components/async-load';
import StatsPagePlaceholder from 'my-sites/stats/stats-page-placeholder';
import FollowList from 'lib/follow-list';
import FollowList from 'lib/follow-list';
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

export default {
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

	insights: function( context ) {
	    let siteId = context.params.site_id;
		const basePath = route.sectionify( context.path );
		const followList = new FollowList();

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Stats', { textOnly: true } ) ) );

		const site = getSite( context.store.getState(), siteId );
		siteId = site ? ( site.ID || 0 ) : 0;

		analytics.pageView.record( basePath, analyticsPageTitle + ' > Insights' );

		const props = { followList };
		renderWithReduxStore(
			<AsyncLoad require="my-sites/stats/stats-insights" placeholder={ <StatsPagePlaceholder /> } { ...props } />,
			document.getElementById( 'primary' ),
			context.store
		);
	},

	overview: function( context, next ) {
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

			const props = {
				period: activeFilter.period,
				path: context.pathname,
			};
			renderWithReduxStore(
				<AsyncLoad placeholder={ <StatsPagePlaceholder /> } require="my-sites/stats/overview" { ...props } />,
				document.getElementById( 'primary' ),
				context.store
			);
		}
	},

	site: function( context, next ) {
		let siteId = context.params.site_id;
		const filters = getSiteFilters( siteId );
		const queryOptions = context.query;
		let date;
		let chartTab;
		let period;
		let numPeriodAgo = 0;
		const basePath = route.sectionify( context.path );
		let baseAnalyticsPath;

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Stats', { textOnly: true } ) ) );

		const currentSite = getSite( context.store.getState(), siteId );
		siteId = currentSite ? ( currentSite.ID || 0 ) : 0;

		const activeFilter = find( filters, ( filter ) => {
			return context.pathname === filter.path || ( filter.altPaths && -1 !== filter.altPaths.indexOf( context.pathname ) );
		} );

		if ( ! activeFilter ) {
			next();
		} else {
			if ( currentSite && currentSite.domain ) {
				// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
				context.store.dispatch( setTitle( i18n.translate( 'Stats', { textOnly: true } ) ) );
			}

			const gmtOffset = getSiteOption( context.store.getState(), siteId, 'gmt_offset' );
			const momentSiteZone = i18n.moment().utcOffset( Number.isFinite( gmtOffset ) ? gmtOffset : 0 );
			if ( queryOptions.startDate && i18n.moment( queryOptions.startDate ).isValid() ) {
				date = i18n.moment( queryOptions.startDate ).locale( 'en' );
				numPeriodAgo = getNumPeriodAgo( momentSiteZone, date, activeFilter.period );
			} else {
				date = rangeOfPeriod( activeFilter.period, momentSiteZone.locale( 'en' ) ).startOf;
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
			chartTab = queryOptions.tab || 'views';

			const siteComponentChildren = {
				path: context.pathname,
				date,
				chartTab,
				context,
				period,
			};

			renderWithReduxStore(
				<AsyncLoad placeholder={ <StatsPagePlaceholder /> } require="my-sites/stats/site" { ...siteComponentChildren } />,
				document.getElementById( 'primary' ),
				context.store
			);
		}
	},

	summary: function( context, next ) {
		let siteId = context.params.site_id;
		const siteFragment = route.getSiteFragment( context.path );
		const queryOptions = context.query;
		const contextModule = context.params.module;
		const filters = [
			{ path: '/stats/' + contextModule + '/' + siteId,
				altPaths: [ '/stats/day/' + contextModule + '/' + siteId ], id: 'stats-day',
				period: 'day' },
			{ path: '/stats/week/' + contextModule + '/' + siteId, id: 'stats-week', period: 'week' },
			{ path: '/stats/month/' + contextModule + '/' + siteId, id: 'stats-month', period: 'month' },
			{ path: '/stats/year/' + contextModule + '/' + siteId, id: 'stats-year', period: 'year' }
		];
		let date;
		let period;

		const validModules = [
			'posts', 'referrers', 'clicks', 'countryviews', 'authors', 'videoplays', 'videodetails', 'podcastdownloads', 'searchterms'
		];
		let momentSiteZone = i18n.moment();
		const basePath = route.sectionify( context.path );

		const site = getSite( context.store.getState(), siteId );
		siteId = site ? ( site.ID || 0 ) : 0;

		const activeFilter = find( filters, ( filter ) => {
			return context.pathname === filter.path || ( filter.altPaths && -1 !== filter.altPaths.indexOf( context.pathname ) );
		} );

		if ( siteFragment && 0 === siteId ) {
			// site is not in the user's site list
			window.location = '/stats';
		} else if ( ! activeFilter || -1 === validModules.indexOf( context.params.module ) ) {
			next();
		} else {
			const gmtOffset = getSiteOption( context.store.getState(), siteId, 'gmt_offset' );
			if ( Number.isFinite( gmtOffset ) ) {
				momentSiteZone = i18n.moment().utcOffset( gmtOffset );
			}
			if ( queryOptions.startDate && i18n.moment( queryOptions.startDate ).isValid() ) {
				date = i18n.moment( queryOptions.startDate );
			} else {
				date = momentSiteZone.endOf( activeFilter.period );
			}
			period = rangeOfPeriod( activeFilter.period, date );

			const extraProps = context.params.module === 'videodetails' ? { postId: parseInt( queryOptions.post, 10 ) } : {};

			let statsQueryOptions = {};

			// All Time Summary Support
			if ( queryOptions.summarize && queryOptions.num ) {
				statsQueryOptions = pick( queryOptions, [ 'num', 'summarize' ] );
				statsQueryOptions.period = 'day';
			}

			analytics.pageView.record(
				basePath,
				analyticsPageTitle + ' > ' + titlecase( activeFilter.period ) + ' > ' + titlecase( context.params.module )
			);

			const props = {
				path: context.pathname,
				statsQueryOptions,
				date,
				context,
				period,
				...extraProps
			};
			renderWithReduxStore(
				<AsyncLoad placeholder={ <StatsPagePlaceholder /> } require="my-sites/stats/summary" { ...props } />,
				document.getElementById( 'primary' ),
				context.store
			);
		}
	},

	post: function( context ) {
		let siteId = context.params.site_id;
		const postId = parseInt( context.params.post_id, 10 );
		const pathParts = context.path.split( '/' );
		const postOrPage = pathParts[ 2 ] === 'post' ? 'post' : 'page';

		const site = getSite( context.store.getState(), siteId );
		siteId = site ? ( site.ID || 0 ) : 0;

		if ( 0 === siteId ) {
			window.location = '/stats';
		} else {
			analytics.pageView.record( '/stats/' + postOrPage + '/:post_id/:site',
				analyticsPageTitle + ' > Single ' + titlecase( postOrPage ) );

			const props = {
				path: context.path,
				postId,
				context,
			};
			renderWithReduxStore(
				<AsyncLoad placeholder={ <StatsPagePlaceholder /> } require="my-sites/stats/stats-post-detail" { ...props } />,
				document.getElementById( 'primary' ),
				context.store
			);
		}
	},

	follows: function( context ) {
	    let siteId = context.params.site_id;
		let pageNum = context.params.page_num;
		const followList = new FollowList();
		const basePath = route.sectionify( context.path );

		const site = getSite( context.store.getState(), siteId );
		siteId = site ? ( site.ID || 0 ) : 0;

		const siteDomain = ( site && ( typeof site.slug !== 'undefined' ) )
			? site.slug : route.getSiteFragment( context.path );

		if ( 0 === siteId ) {
			window.location = '/stats';
		} else {
			pageNum = parseInt( pageNum, 10 );

			if ( ! pageNum || pageNum < 1 ) {
				pageNum = 1;
			}

			analytics.pageView.record(
				basePath.replace( '/' + pageNum, '' ),
				analyticsPageTitle + ' > Followers > Comment'
			);

			const props = {
				path: context.path,
				page: pageNum,
				perPage: 20,
				total: 10,
				domain: siteDomain,
				siteId,
				followList,
			};
			renderWithReduxStore(
				<AsyncLoad placeholder={ <StatsPagePlaceholder /> } require="my-sites/stats/comment-follows" { ...props } />,
				document.getElementById( 'primary' ),
				context.store
			);
		}
	},

	activityLog: function( context ) {
		const state = context.store.getState();
		const siteId = getSelectedSiteId( state );
		const isJetpack = isJetpackSite( state, siteId );
		const startDate = i18n.moment( context.query.startDate, 'YYYY-MM-DD' ).isValid()
			? context.query.startDate
			: undefined;

		if ( siteId && ! isJetpack ) {
			page.redirect( '/stats' );
		} else {
			analytics.pageView.record( '/stats/activity/:site', analyticsPageTitle + ' > Activity ' );

			const props = {
				path: context.path,
				siteId,
				context,
				startDate,
			};
			renderWithReduxStore(
				<AsyncLoad placeholder={ <StatsPagePlaceholder /> } require="my-sites/stats/activity-log" { ...props } />,
				document.getElementById( 'primary' ),
				context.store
			);
		}
	}
};
