import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Spinner } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button as CoreButton } from '@wordpress/components';
import clsx from 'clsx';
import { localize, translate } from 'i18n-calypso';
import { find, flowRight } from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import IllustrationStats from 'calypso/assets/images/stats/illustration-stats.svg';
import { emailIntervals } from 'calypso/blocks/stats-navigation/constants';
import Intervals from 'calypso/blocks/stats-navigation/intervals';
import DocumentHead from 'calypso/components/data/document-head';
import QueryEmailStats from 'calypso/components/data/query-email-stats';
import QueryPostStats from 'calypso/components/data/query-post-stats';
import QueryPosts from 'calypso/components/data/query-posts';
import EmptyContent from 'calypso/components/empty-content';
import NavigationHeader from 'calypso/components/navigation-header';
import WebPreview from 'calypso/components/web-preview';
import { decodeEntities, stripHTML } from 'calypso/lib/formatting';
import memoizeLast from 'calypso/lib/memoize-last';
import PageHeader from 'calypso/my-sites/stats/components/headers/page-header';
import Main from 'calypso/my-sites/stats/components/stats-main';
import { STATS_PRODUCT_NAME } from 'calypso/my-sites/stats/constants';
import StatsEmailModule from 'calypso/my-sites/stats/stats-email-module';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSitePost, getPostPreviewUrl } from 'calypso/state/posts/selectors';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import { getSiteSlug, isJetpackSite, isSitePreviewable } from 'calypso/state/sites/selectors';
import { PERIOD_ALL_TIME } from 'calypso/state/stats/emails/constants';
import { getEmailStat, isRequestingEmailStats } from 'calypso/state/stats/emails/selectors';
import { getPeriodWithFallback, getCharts } from 'calypso/state/stats/emails/utils';
import { getPostStat, isRequestingPostStats } from 'calypso/state/stats/posts/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import DatePicker from '../stats-date-picker';
import StatsDetailsNavigation from '../stats-details-navigation';
import ChartTabs from '../stats-email-chart-tabs';
import StatsEmailTopRow from '../stats-email-top-row';
import { StatsNoContentBanner } from '../stats-no-content-banner';
import PageViewTracker from '../stats-page-view-tracker';
import StatsPeriodHeader from '../stats-period-header';
import StatsPeriodNavigation from '../stats-period-navigation';
import { getPathWithUpdatedQueryString } from '../utils';
import './style.scss';

const pageTitles = {
	opens: translate( 'Email opens' ),
	clicks: translate( 'Email clicks' ),
};

const getActiveTab = ( chartTab, statType ) => {
	const charts = getCharts( statType );
	return find( charts, { attr: chartTab } ) || charts[ 0 ];
};

const memoizedQuery = memoizeLast( ( period, endOf ) => ( {
	period,
	date: endOf,
} ) );

class StatsEmailDetail extends Component {
	static propTypes = {
		path: PropTypes.string,
		siteId: PropTypes.number,
		givenSiteId: PropTypes.string,
		postId: PropTypes.number,
		statType: PropTypes.string,
		translate: PropTypes.func,
		context: PropTypes.object,
		isRequestingStats: PropTypes.bool,
		countViews: PropTypes.array,
		siteSlug: PropTypes.string,
		showViewLink: PropTypes.bool,
		previewUrl: PropTypes.string,
		post: PropTypes.object,
		hasValidDate: PropTypes.bool,
	};

	state = {
		showPreview: false,
		activeTab: null,
		activeLegend: null,
		maxBars: 0,
	};

	static getDerivedStateFromProps( props, state ) {
		// when switching from one tab to another or when initializing the component,
		// reset the active legend charts to the defaults for that tab. The legends
		// can be then toggled on and off by the user in `onLegendClick`.
		const activeTab = getActiveTab( props.chartTab, props.statType );
		if ( props.chartTab !== state.activeTab ) {
			return {
				activeTab,
				activeLegend: activeTab.legendOptions || [],
			};
		}
		return null;
	}

	getAvailableLegend() {
		const activeTab = getActiveTab( this.props.chartTab, this.props.statType );
		return activeTab.legendOptions || [];
	}

	getNavigationItemsWithTitle = ( title ) => {
		const localizedTabNames = {
			traffic: this.props.translate( 'Traffic' ),
			insights: this.props.translate( 'Insights' ),
			store: this.props.translate( 'Store' ),
			ads: this.props.translate( 'Ads' ),
			subscribers: this.props.translate( 'Subscribers' ),
		};
		const possibleBackLinks = {
			traffic: '/stats/day/',
			insights: '/stats/insights/',
			store: '/stats/store/',
			ads: '/stats/ads/',
			subscribers: '/stats/subscribers/',
		};
		// We track the parent tab via sessionStorage.
		const lastClickedTab = sessionStorage.getItem( 'jp-stats-last-tab' );
		const backLabel = localizedTabNames[ lastClickedTab ] || localizedTabNames.traffic;
		let backLink = possibleBackLinks[ lastClickedTab ] || possibleBackLinks.traffic;
		// Append the domain as needed.
		const domain = this.props.siteSlug;
		if ( domain?.length > 0 ) {
			backLink += domain;
		}

		if ( ! title ) {
			title = <em>{ this.props.translate( 'Untitled' ) }</em>;
		}

		// Wrap it up!
		return [ { label: backLabel, href: backLink }, { label: title } ];
	};

	componentDidMount() {
		window.scrollTo( 0, 0 );
	}

	getTitle = ( statType ) => pageTitles[ statType ];

	getNavigationTitle = () => {
		const { isPostHomepage, post, postFallback } = this.props;

		if ( isPostHomepage ) {
			return translate( 'Home page / Archives' );
		}

		if ( typeof post?.title === 'string' && post.title.length ) {
			return decodeEntities( stripHTML( post.title ) );
		}

		if ( typeof postFallback?.post_title === 'string' && postFallback.post_title.length ) {
			return decodeEntities( stripHTML( postFallback.post_title ) );
		}

		return null;
	};

	openPreview = () => {
		this.setState( {
			showPreview: true,
		} );
	};

	closePreview = () => {
		this.setState( {
			showPreview: false,
		} );
	};

	onChangeLegend = ( activeLegend ) => this.setState( { activeLegend } );

	onChangeMaxBars = ( maxBars ) => this.setState( { maxBars } );

	switchChart = ( tab ) => {
		if ( ! tab.loading && tab.attr !== this.props.chartTab ) {
			this.props.recordGoogleEvent( 'Stats', 'Clicked ' + titlecase( tab.attr ) + ' Tab' );
			// switch the tab by navigating to route with updated query string
			page.show( getPathWithUpdatedQueryString( { tab: tab.attr } ) );
		}
	};

	getCharts() {
		return getCharts( this.props.statType );
	}

	render() {
		const {
			isRequestingStats,
			countViews,
			postId,
			siteId,
			givenSiteId,
			date,
			slug,
			isSitePrivate,
			post,
			statType,
			hasValidDate,
			showNoDataInfo,
			showViewLink,
			previewUrl,
			siteSlug,
		} = this.props;
		const { maxBars } = this.state;

		const queryDate = date.format( 'YYYY-MM-DD' );
		const noViewsLabel = translate( 'Your email has not received any views yet!' );

		const { period, endOf } = this.props.period;
		const traffic = {
			label: translate( 'Traffic' ),
			path: `/stats/email/${ statType }`,
		};

		const query = memoizedQuery( period, endOf.format( 'YYYY-MM-DD' ) );
		const slugPath = slug ? `/${ slug }` : '';
		const pathTemplate = `${ traffic.path }/{{ interval }}/${ postId }${ slugPath }`;

		// TODO: Refactor navigationItems to a single object with backLink and title attributes.
		const navigationItems = this.getNavigationItemsWithTitle( this.getNavigationTitle() );

		const backLinkProps = {
			text: navigationItems[ 0 ].label,
			url: navigationItems[ 0 ].href,
		};
		const titleProps = {
			title: navigationItems[ 1 ].label,
			// Remove the default logo for Odyssey stats.
			titleLogo: null,
		};

		let actionLabel;
		const postType = post && post.type !== null ? post.type : 'post';
		if ( postType === 'page' ) {
			actionLabel = translate( 'View Page' );
		} else {
			actionLabel = translate( 'View Post' );
		}

		return (
			<>
				<Main
					className={ clsx( 'stats', 'stats__email-detail', {
						'has-fixed-nav': ! config.isEnabled( 'stats/navigation-improvement' ),
					} ) }
				>
					<QueryPosts siteId={ siteId } postId={ postId } />
					<QueryPostStats siteId={ siteId } postId={ postId } />
					<QueryEmailStats
						siteId={ siteId }
						postId={ postId }
						date={ query.date }
						period={ query.period }
						statType={ statType }
						hasValidDate={ hasValidDate }
						quantity={ maxBars }
						isRequesting={ isRequestingStats }
					/>

					<DocumentHead title={ STATS_PRODUCT_NAME } />

					<PageViewTracker
						path="/stats/email/:statType/:site/:period/:email_id"
						title="Stats > Single Email"
					/>

					{ config.isEnabled( 'stats/navigation-improvement' ) ? (
						<PageHeader
							backLinkProps={ backLinkProps }
							titleProps={ titleProps }
							rightSection={
								showViewLink && (
									<CoreButton onClick={ this.openPreview } variant="primary">
										<span>{ actionLabel }</span>
									</CoreButton>
								)
							}
						/>
					) : (
						<NavigationHeader
							navigationItems={ this.getNavigationItemsWithTitle( this.getNavigationTitle() ) }
						/>
					) }

					{ ! isRequestingStats && ! countViews && post && (
						<EmptyContent
							title={ noViewsLabel }
							line={ translate( 'Learn some tips to attract more visitors' ) }
							action={ translate( 'Get more traffic!' ) }
							actionURL={ localizeUrl(
								'https://wordpress.com/support/getting-more-views-and-traffic/'
							) }
							actionTarget="blank"
							illustration={ IllustrationStats }
							illustrationWidth={ 150 }
						/>
					) }
					{ post ? (
						<>
							<div
								className={ clsx( 'stats-navigation', 'stats-navigation--modernized', {
									'stats-navigation--improved': config.isEnabled( 'stats/navigation-improvement' ),
								} ) }
							>
								<StatsDetailsNavigation
									postId={ postId }
									period={ period }
									statType={ statType }
									givenSiteId={ givenSiteId }
								/>
							</div>
							<div className="stats__email-wrapper">
								<h3 className="highlight-cards-heading">{ this.getTitle( statType ) }</h3>

								<StatsEmailTopRow
									siteId={ siteId }
									postId={ postId }
									statType={ statType }
									post={ post }
								/>

								<StatsPeriodHeader>
									<StatsPeriodNavigation
										date={ date }
										period={ period }
										url={ `/stats/email/${ statType }/${ period }/${ postId }/${ slug }` }
										maxBars={ maxBars }
										isEmailStats
									>
										<DatePicker
											period={ period }
											date={ date }
											query={ query }
											statsType="statsTopPosts"
											showQueryDate
										/>
									</StatsPeriodNavigation>
									<Intervals
										selected={ period }
										pathTemplate={ pathTemplate }
										compact={ false }
										intervalValues={ emailIntervals }
									/>
								</StatsPeriodHeader>

								{ showNoDataInfo && (
									<div className="no-data">
										{ translate( '⚠️ There is no data before 2022-11-24 for the email stats' ) }
									</div>
								) }
								<ChartTabs
									activeTab={ getActiveTab( this.props.chartTab, statType ) }
									activeLegend={ this.state.activeLegend }
									availableLegend={ this.getAvailableLegend() }
									onChangeLegend={ this.onChangeLegend }
									switchTab={ this.switchChart }
									charts={ this.getCharts() }
									queryDate={ queryDate }
									period={ this.props.period }
									chartTab={ this.props.chartTab }
									postId={ postId }
									statType={ statType }
									onChangeMaxBars={ this.onChangeMaxBars }
									maxBars={ maxBars }
								/>

								{ ! isSitePrivate && <StatsNoContentBanner siteId={ siteId } siteSlug={ slug } /> }
								<div className="stats__module-list">
									<StatsEmailModule
										path="countries"
										statType={ statType }
										postId={ postId }
										siteId={ siteId }
										period={ PERIOD_ALL_TIME }
										date={ queryDate }
									/>

									<StatsEmailModule
										path="devices"
										statType={ statType }
										postId={ postId }
										siteId={ siteId }
										period={ PERIOD_ALL_TIME }
										date={ queryDate }
									/>

									<StatsEmailModule
										path="clients"
										statType={ statType }
										postId={ postId }
										siteId={ siteId }
										period={ PERIOD_ALL_TIME }
										date={ queryDate }
									/>
									{ statType === 'clicks' && (
										<StatsEmailModule
											path="links"
											statType={ statType }
											postId={ postId }
											siteId={ siteId }
											period={ PERIOD_ALL_TIME }
											date={ queryDate }
										/>
									) }
								</div>
							</div>

							<WebPreview
								showPreview={ this.state.showPreview }
								defaultViewportDevice="tablet"
								previewUrl={ `${ previewUrl }?demo=true&iframe=true&theme_preview=true` }
								externalUrl={ previewUrl }
								onClose={ this.closePreview }
							>
								<CoreButton href={ `/post/${ siteSlug }/${ postId }` }>
									{ translate( 'Edit' ) }
								</CoreButton>
							</WebPreview>
						</>
					) : (
						<Spinner baseClassName="calypso-spinner" />
					) }
				</Main>
			</>
		);
	}
}

const connectComponent = connect(
	( state, ownProps ) => {
		const { postId, statType, isValidStartDate } = ownProps;
		const siteId = getSelectedSiteId( state );
		const isJetpack = isJetpackSite( state, siteId );
		const isPreviewable = isSitePreviewable( state, siteId );
		const postFallback = getPostStat( state, siteId, postId, 'post' );
		const post = getSitePost( state, siteId, postId ) ?? {
			title: postFallback?.post_title,
			date: postFallback?.post_date,
			ID: postFallback?.ID,
		};

		// set start date to date of our post
		// we show a loading indicator until post is loaded
		const {
			period: { period, endOf },
			date,
			hasValidDate,
		} = getPeriodWithFallback( ownProps.period, ownProps.date, isValidStartDate, post?.date );

		const showNoDataInfo = moment( date ).isBefore( moment( '2022-11-24' ) );

		return {
			countViews: getEmailStat( state, siteId, postId, period, statType ),
			isRequestingStats:
				isRequestingEmailStats(
					state,
					siteId,
					postId,
					period,
					statType,
					endOf.format( 'YYYY-MM-DD' )
				) || isRequestingPostStats( state, siteId, postId ),
			siteSlug: getSiteSlug( state, siteId ),
			slug: getSelectedSiteSlug( state ),
			post,
			postFallback,
			isSitePrivate: isPrivateSite( state, siteId ),
			siteId,
			period: { period, endOf },
			date,
			hasValidDate,
			showNoDataInfo,
			showViewLink: ! isJetpack && isPreviewable,
			previewUrl: getPostPreviewUrl( state, siteId, postId ),
		};
	},
	{ recordGoogleEvent }
);

export default flowRight( connectComponent, localize )( StatsEmailDetail );
