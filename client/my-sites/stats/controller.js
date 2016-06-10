/**
 * External Dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	store = require( 'store' ),
	page = require( 'page' ),
	i18n = require( 'i18n-calypso' ),
	get = require( 'lodash/get' ),
	ReactRedux = require( 'react-redux' );

/**
 * Internal Dependencies
 */
var user = require( 'lib/user' )(),
	sites = require( 'lib/sites-list' )(),
	route = require( 'lib/route' ),
	analytics = require( 'lib/analytics' ),
	titlecase = require( 'to-title-case' ),
	analyticsPageTitle = 'Stats',
	layoutFocus = require( 'lib/layout-focus' ),
	titleActions = require( 'lib/screen-title/actions' );

function getVisitDates() {
	var statsVisitDates = store.get( 'statVisits' ) || [];
	return statsVisitDates;
}

function recordVisitDate() {
	var statsVisitDates = getVisitDates(),
		visitDate = i18n.moment().format( 'YYYY-MM-DD' );

	if ( statsVisitDates.indexOf( visitDate ) === -1 ) {
		statsVisitDates.push( visitDate );
	}

	if ( statsVisitDates.length > 10 ) {
		statsVisitDates = statsVisitDates.slice( statsVisitDates.length - 10 );
	}

	store.set( 'statVisits', statsVisitDates );
}

function rangeOfPeriod( period, date ) {
	var periodRange = {
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
	var endOfCurrentPeriod = momentSiteZone.endOf( period ),
		durationAgo = i18n.moment.duration( endOfCurrentPeriod.diff( date ) ),
		numPeriodAgo;

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
	var filters = [
		{ title: i18n.translate( 'Insights' ), path: '/stats/insights/' + siteId, id: 'stats-insights' },
		{ title: i18n.translate( 'Days' ), path: '/stats/day/' + siteId, id: 'stats-day', period: 'day' },
		{ title: i18n.translate( 'Weeks' ), path: '/stats/week/' + siteId, id: 'stats-week', period: 'week' },
		{ title: i18n.translate( 'Months' ), path: '/stats/month/' + siteId, id: 'stats-month', period: 'month' },
		{ title: i18n.translate( 'Years' ), path: '/stats/year/' + siteId, id: 'stats-year', period: 'year' }
	];

	return filters;
}

module.exports = {

	redirectToDefaultSitePage: function( context, next ) {
		var siteFragment = route.getSiteFragment( context.path );

		if ( siteFragment ) {
			// if we are redirecting we need to retain our intended layout-focus
			layoutFocus.setNext( layoutFocus.getCurrent() );
			page.redirect( route.getStatsDefaultSitePage( siteFragment ) );
		} else {
			next();
		}
	},

	insights: function( context, next ) {
		var Insights = require( 'my-sites/stats/stats-insights' ),
			StatsList = require( 'lib/stats/stats-list' ),
			FollowList = require( 'lib/follow-list' ),
			site,
			siteId = context.params.site_id,
			filters = getSiteFilters.bind( null, siteId ),
			activeFilter = false,
			basePath = route.sectionify( context.path ),
			followList,
			allTimeList,
			insightsList,
			commentsList,
			tagsList,
			publicizeList,
			wpcomFollowersList,
			emailFollowersList,
			commentFollowersList,
			summaryDate,
			summarySites = [],
			momentSiteZone = i18n.moment(),
			StatsComponent = Insights;

		followList = new FollowList();

		titleActions.setTitle( i18n.translate( 'Stats', { textOnly: true } ) );

		activeFilter = filters().filter( function( filter ) {
			return 'stats-insights' === filter.id;
		} );
		activeFilter = activeFilter.shift();

		site = sites.getSite( siteId );
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

		allTimeList = new StatsList( { siteID: siteId, statType: 'stats', domain: siteDomain } );
		insightsList = new StatsList( { siteID: siteId, statType: 'statsInsights', domain: siteDomain } );
		commentsList = new StatsList( { siteID: siteId, statType: 'statsComments', domain: siteDomain } );
		tagsList = new StatsList( { siteID: siteId, statType: 'statsTags', domain: siteDomain } );
		publicizeList = new StatsList( { siteID: siteId, statType: 'statsPublicize', domain: siteDomain } );
		wpcomFollowersList = new StatsList( { siteID: siteId, statType: 'statsFollowers', type: 'wpcom', domain: siteDomain, max: 7 } );
		emailFollowersList = new StatsList( { siteID: siteId, statType: 'statsFollowers', type: 'email', domain: siteDomain, max: 7 } );
		commentFollowersList = new StatsList( { siteID: siteId, statType: 'statsCommentFollowers', domain: siteDomain, max: 7 } );

		analytics.pageView.record( basePath, analyticsPageTitle + ' > Insights' );

		ReactDom.render(
			React.createElement( ReactRedux.Provider, { store: context.store },
				React.createElement( StatsComponent, {
					site: site,
					followList: followList,
					allTimeList: allTimeList,
					insightsList: insightsList,
					commentsList: commentsList,
					tagsList: tagsList,
					publicizeList: publicizeList,
					wpcomFollowersList: wpcomFollowersList,
					emailFollowersList: emailFollowersList,
					commentFollowersList: commentFollowersList,
					summaryDate: summaryDate
				} )
			),
			document.getElementById( 'primary' )
		);
	},

	overview: function( context, next ) {
		var StatsComponent = require( './overview' ),
			filters = function() {
				return [
					{ title: i18n.translate( 'Days' ), path: '/stats/day', altPaths: ['/stats'], id: 'stats-day', period: 'day' },
					{ title: i18n.translate( 'Weeks' ), path: '/stats/week', id: 'stats-week', period: 'week' },
					{ title: i18n.translate( 'Months' ), path: '/stats/month', id: 'stats-month', period: 'month' },
					{ title: i18n.translate( 'Years' ), path: '/stats/year', id: 'stats-year', period: 'year' }
				];
			},
			activeFilter = false,
			queryOptions = context.query,
			basePath = route.sectionify( context.path ),
			summarySites;

		window.scrollTo( 0, 0 );

		titleActions.setTitle( i18n.translate( 'Stats', { textOnly: true } ) );

		activeFilter = filters().filter( function( filter ) {
			return context.pathname === filter.path || ( filter.altPaths && -1 !== filter.altPaths.indexOf( context.pathname ) );
		}, this );

		// Validate that date filter is legit
		if ( 0 === activeFilter.length ) {
			next();
		} else {
			if ( queryOptions.from ) {
				// For setting the oldStatsLink back to my-stats or wp-admin, depending on source
				store.set( 'oldStatsLink', queryOptions.from );
			}

			summarySites = sites.getVisible().map( function( site ) {
				var momentSiteZone = i18n.moment();
				if ( 'object' === typeof( site.options ) && 'undefined' !== typeof( site.options.gmt_offset ) ) {
					momentSiteZone = i18n.moment().utcOffset( site.options.gmt_offset );
				}

				return {
					ID: site.ID,
					date: momentSiteZone.endOf( activeFilter.period ).format( 'YYYY-MM-DD' )
				};
			} );

			activeFilter = activeFilter.shift();

			analytics.mc.bumpStat( 'calypso_stats_overview_period', activeFilter.period );
			analytics.pageView.record( basePath, analyticsPageTitle + ' > ' + titlecase( activeFilter.period ) );

			recordVisitDate();

			ReactDom.render(
				React.createElement( ReactRedux.Provider, { store: context.store },
					React.createElement( StatsComponent, {
						period: activeFilter.period,
						sites: sites,
						path: context.pathname,
						user: user
					} )
				),
				document.getElementById( 'primary' )
			);
		}
	},

	site: function( context, next ) {
		var currentSite,
			siteId = context.params.site_id,
			siteFragment = route.getSiteFragment( context.path ),
			queryOptions = context.query,
			FollowList = require( 'lib/follow-list' ),
			SiteStatsComponent = require( 'my-sites/stats/site' ),
			StatsList = require( 'lib/stats/stats-list' ),
			filters = getSiteFilters.bind( null, siteId ),
			activeFilter = false,
			followList,
			activeTabVisitsList,
			visitsList,
			date,
			charts = function() {
				return [
					{ attr: 'views', legendOptions: [ 'visitors' ], gridicon: 'visible', label: i18n.translate( 'Views', { context: 'noun' } ) },
					{ attr: 'visitors', gridicon: 'user', label: i18n.translate( 'Visitors', { context: 'noun' } ) },
					{ attr: 'likes', gridicon: 'star', label: i18n.translate( 'Likes', { context: 'noun' } ) },
					{ attr: 'comments', gridicon: 'comment', label: i18n.translate( 'Comments', { context: 'noun' } ) }
				];
			},
			chartDate,
			chartTab,
			visitsListFields,
			startDate,
			endDate,
			chartEndDate,
			postsPagesList,
			tagsList,
			referrersList,
			clicksList,
			authorsList,
			period,
			chartPeriod,
			countriesList,
			videoPlaysList,
			commentsList,
			wpcomFollowersList,
			emailFollowersList,
			commentFollowersList,
			publicizeList,
			searchTermsList,
			siteOffset = 0,
			momentSiteZone = i18n.moment(),
			numPeriodAgo = 0,
			basePath = route.sectionify( context.path ),
			baseAnalyticsPath,
			chartQuantity = 10,
			siteComponent;

		titleActions.setTitle( i18n.translate( 'Stats', { textOnly: true } ) );

		currentSite = sites.getSite( siteId );
		if ( ! currentSite ) {
			currentSite = sites.getSite( parseInt( siteId, 10 ) );
		}
		siteId = currentSite ? ( currentSite.ID || 0 ) : 0;

		activeFilter = filters().filter( function( filter ) {
			return context.pathname === filter.path || ( filter.altPaths && -1 !== filter.altPaths.indexOf( context.pathname ) );
		}, this );

		if ( ( ! siteFragment ) || ( 0 === activeFilter.length ) ) {
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
				titleActions.setTitle( i18n.translate( 'Stats', { textOnly: true } ), { siteID: currentSite.domain } );
			}

			if ( currentSite && 'object' === typeof currentSite.options && 'undefined' !== typeof currentSite.options.gmt_offset ) {
				siteOffset = currentSite.options.gmt_offset;
			}
			momentSiteZone = i18n.moment().utcOffset( siteOffset );
			activeFilter = activeFilter.shift();
			chartDate = rangeOfPeriod( activeFilter.period, momentSiteZone.clone() ).endOf;
			if ( queryOptions.startDate && i18n.moment( queryOptions.startDate ).isValid ) {
				date = i18n.moment( queryOptions.startDate );
				numPeriodAgo = getNumPeriodAgo( momentSiteZone, date, activeFilter.period );
			} else {
				date = rangeOfPeriod( activeFilter.period, momentSiteZone.clone() ).startOf;
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

			recordVisitDate();

			period = rangeOfPeriod( activeFilter.period, date );
			chartPeriod = rangeOfPeriod( activeFilter.period, chartDate );
			startDate = period.startOf.format( 'YYYY-MM-DD' );
			endDate = period.endOf.format( 'YYYY-MM-DD' );
			chartEndDate = chartPeriod.endOf.format( 'YYYY-MM-DD' );

			if ( queryOptions.from ) {
				// For setting the oldStatsLink back to my-stats or wp-admin, depending on source
				store.set( 'oldStatsLink', queryOptions.from );
			}

			// If there is saved tab in store, use it then remove
			if ( store.get( 'statTab' + siteId ) ) {
				chartTab = store.get( 'statTab' + siteId );
				store.remove( 'statTab' + siteId );
			} else {
				chartTab = 'views';
			}

			visitsListFields = chartTab;
			// If we are on the default Tab, grab visitors too
			if ( 'views' === visitsListFields ) {
				visitsListFields = 'views,visitors';
			}

			if ( queryOptions.tab ) {
				store.set( 'statTab' + siteId, queryOptions.tab );
				// We don't want to persist tab throughout navigation, it's only for selecting original tab
				page.redirect( context.pathname );
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

			followList = new FollowList();
			activeTabVisitsList = new StatsList( { siteID: siteId, statType: 'statsVisits', unit: activeFilter.period, quantity: chartQuantity, date: chartEndDate, stat_fields: visitsListFields, domain: siteDomain } );
			visitsList = new StatsList( { siteID: siteId, statType: 'statsVisits', unit: activeFilter.period, quantity: chartQuantity, date: chartEndDate, stat_fields: 'views,visitors,likes,comments,post_titles', domain: siteDomain } );
			postsPagesList = new StatsList( { siteID: siteId, statType: 'statsTopPosts', period: activeFilter.period, date: endDate, domain: siteDomain } );
			referrersList = new StatsList( { siteID: siteId, statType: 'statsReferrers', period: activeFilter.period, date: endDate, domain: siteDomain } );
			clicksList = new StatsList( { siteID: siteId, statType: 'statsClicks', period: activeFilter.period, date: endDate, domain: siteDomain } );
			authorsList = new StatsList( { siteID: siteId, statType: 'statsTopAuthors', period: activeFilter.period, date: endDate, domain: siteDomain } );
			countriesList = new StatsList( { siteID: siteId, statType: 'statsCountryViews', period: activeFilter.period, date: endDate, domain: siteDomain } );
			videoPlaysList = new StatsList( { siteID: siteId, statType: 'statsVideoPlays', period: activeFilter.period, date: endDate, domain: siteDomain } );
			searchTermsList = new StatsList( { siteID: siteId, statType: 'statsSearchTerms', period: activeFilter.period, date: endDate, domain: siteDomain } );
			tagsList = new StatsList( { siteID: siteId, statType: 'statsTags', domain: siteDomain } );
			commentsList = new StatsList( { siteID: siteId, statType: 'statsComments', domain: siteDomain } );
			wpcomFollowersList = new StatsList( { siteID: siteId, statType: 'statsFollowers', type: 'wpcom', domain: siteDomain, max: 7 } );
			emailFollowersList = new StatsList( { siteID: siteId, statType: 'statsFollowers', type: 'email', domain: siteDomain, max: 7 } );
			commentFollowersList = new StatsList( { siteID: siteId, statType: 'statsCommentFollowers', domain: siteDomain, max: 7 } );
			publicizeList = new StatsList( { siteID: siteId, statType: 'statsPublicize', domain: siteDomain } );

			siteComponent = SiteStatsComponent;

			ReactDom.render(
				React.createElement( siteComponent, {
					date: date,
					charts: charts,
					chartDate: chartDate,
					chartTab: chartTab,
					path: context.pathname,
					context: context,
					sites: sites,
					activeTabVisitsList: activeTabVisitsList,
					visitsList: visitsList,
					postsPagesList: postsPagesList,
					referrersList: referrersList,
					clicksList: clicksList,
					authorsList: authorsList,
					countriesList: countriesList,
					videoPlaysList: videoPlaysList,
					siteId: siteId,
					period: period,
					chartPeriod: chartPeriod,
					tagsList: tagsList,
					commentsList: commentsList,
					wpcomFollowersList: wpcomFollowersList,
					emailFollowersList: emailFollowersList,
					commentFollowersList: commentFollowersList,
					publicizeList: publicizeList,
					followList: followList,
					searchTermsList: searchTermsList,
					slug: siteDomain
				} ),
				document.getElementById( 'primary' )
			);
		}
	},

	summary: function( context, next ) {
		var site,
			siteId = context.params.site_id,
			siteFragment = route.getSiteFragment( context.path ),
			queryOptions = context.query,
			StatsList = require( 'lib/stats/stats-list' ),
			FollowList = require( 'lib/follow-list' ),
			StatsSummaryComponent = require( 'my-sites/stats/summary' ),
			filters = function( contextModule, siteId ) {
				return [
					{ title: i18n.translate( 'Days' ), path: '/stats/' + contextModule + '/' + siteId, altPaths: [ '/stats/day/' + contextModule + '/' + siteId ], id: 'stats-day', period: 'day', back: '/stats/' + siteId },
					{ title: i18n.translate( 'Weeks' ), path: '/stats/week/' + contextModule + '/' + siteId, id: 'stats-week', period: 'week', back: '/stats/week/' + siteId },
					{ title: i18n.translate( 'Months' ), path: '/stats/month/' + contextModule + '/' + siteId, id: 'stats-month', period: 'month', back: '/stats/month/' + siteId },
					{ title: i18n.translate( 'Years' ), path: '/stats/year/' + contextModule + '/' + siteId, id: 'stats-year', period: 'year', back: '/stats/year/' + siteId }
				];
			}.bind( null, context.params.module, siteId ),
			activeFilter = false,
			date,
			endDate,
			period,
			summaryList,
			visitsList,
			followList = new FollowList(),
			validModules = [ 'posts', 'referrers', 'clicks', 'countryviews', 'authors', 'videoplays', 'videodetails', 'searchterms' ],
			momentSiteZone = i18n.moment(),
			basePath = route.sectionify( context.path );

		site = sites.getSite( siteId );
		if ( ! site ) {
			site = sites.getSite( parseInt( siteId, 10 ) );
		}
		siteId = site ? ( site.ID || 0 ) : 0;

		activeFilter = filters().filter( function( filter ) {
			return context.pathname === filter.path || ( filter.altPaths && -1 !== filter.altPaths.indexOf( context.pathname ) );
		}, this );

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
		} else if ( 0 === activeFilter.length || -1 === validModules.indexOf( context.params.module ) ) {
			next();
		} else {
			if ( 'object' === typeof( site.options ) && 'undefined' !== typeof( site.options.gmt_offset ) ) {
				momentSiteZone = i18n.moment().utcOffset( site.options.gmt_offset );
			}
			activeFilter = activeFilter.shift();
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
					visitsList = new StatsList( { statType: 'statsVisits', unit: activeFilter.period, siteID: siteId, quantity: 10, date: endDate, domain: siteDomain } );
					summaryList = new StatsList( { statType: 'statsTopPosts', siteID: siteId, period: activeFilter.period, date: endDate, max: 0, domain: siteDomain } );
					break;

				case 'referrers':
					summaryList = new StatsList( { siteID: siteId, statType: 'statsReferrers', period: activeFilter.period, date: endDate, max: 0, domain: siteDomain } );
					break;

				case 'clicks':
					summaryList = new StatsList( { statType: 'statsClicks', siteID: siteId, period: activeFilter.period, date: endDate, max: 0, domain: siteDomain } );
					break;

				case 'countryviews':
					summaryList = new StatsList( { siteID: siteId, statType: 'statsCountryViews', period: activeFilter.period, date: endDate, max: 0, domain: siteDomain } );
					break;

				case 'authors':
					summaryList = new StatsList( { statType: 'statsTopAuthors', siteID: siteId, period: activeFilter.period, date: endDate, max: 0, domain: siteDomain } );
					break;

				case 'videoplays':
					summaryList = new StatsList( { statType: 'statsVideoPlays', siteID: siteId, period: activeFilter.period, date: endDate, max: 0, domain: siteDomain } );
					break;

				case 'videodetails':
					summaryList = new StatsList( { statType: 'statsVideo', post: queryOptions.post, siteID: siteId, period: activeFilter.period, date: endDate, max: 0, domain: siteDomain } );
					break;

				case 'searchterms':
					summaryList = new StatsList( { siteID: siteId, statType: 'statsSearchTerms', period: activeFilter.period, date: endDate, max: 0, domain: siteDomain } );
					break;

			}

			analytics.pageView.record(
				basePath,
				analyticsPageTitle + ' > ' + titlecase( activeFilter.period ) + ' > ' + titlecase( context.params.module )
			);

			ReactDom.render(
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
				document.getElementById( 'primary' )
			);
		}
	},

	post: function( context ) {
		var site,
			siteId = context.params.site_id,
			postId = parseInt( context.params.post_id, 10 ),
			StatsPostComponent = require( 'my-sites/stats/stats-post-detail' ),
			StatsList = require( 'lib/stats/stats-list' ),
			pathParts = context.path.split( '/' ),
			postOrPage = pathParts[ 2 ] === 'post' ? 'post' : 'page',
			postViewsList;

		site = sites.getSite( siteId );
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

			analytics.pageView.record( '/stats/' + postOrPage + '/:post_id/:site', analyticsPageTitle + ' > Single ' + titlecase( postOrPage ) );

			ReactDom.render(
				React.createElement( StatsPostComponent, {
					siteId: siteId,
					postId: postId,
					sites: sites,
					context: context,
					path: context.path,
					postViewsList: postViewsList
				} ),
				document.getElementById( 'primary' )
			);
		}
	},

	follows: function( context, next ) {
		var site,
			siteId = context.params.site_id,
			FollowList = require( 'lib/follow-list' ),
			FollowsComponent = require( 'my-sites/stats/follows' ),
			StatsList = require( 'lib/stats/stats-list' ),
			validFollowTypes = [ 'wpcom', 'email', 'comment' ],
			followType = context.params.follow_type,
			pageNum = context.params.page_num,
			followList = new FollowList(),
			followersList,
			basePath = route.sectionify( context.path );

		site = sites.getSite( siteId );
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
					followersList = new StatsList( { siteID: siteId, statType: 'statsCommentFollowers', domain: siteDomain, max: 20, page: pageNum } );
					break;

				case 'email':
				case 'wpcom':
					followersList = new StatsList( { siteID: siteId, statType: 'statsFollowers', domain: siteDomain, max: 20, page: pageNum, type: followType } );
					break;
			}

			analytics.pageView.record(
				basePath.replace( '/' + pageNum, '' ),
				analyticsPageTitle + ' > Followers > ' + titlecase( followType )
			);

			ReactDom.render(
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
				document.getElementById( 'primary' )
			);
		}
	}
};
