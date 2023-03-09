import { Spinner } from '@automattic/components';
import { localize, translate } from 'i18n-calypso';
import { find, flowRight } from 'lodash';
import moment from 'moment';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import { emailIntervals } from 'calypso/blocks/stats-navigation/constants';
import Intervals from 'calypso/blocks/stats-navigation/intervals';
import DocumentHead from 'calypso/components/data/document-head';
import QueryEmailStats from 'calypso/components/data/query-email-stats';
import EmptyContent from 'calypso/components/empty-content';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import memoizeLast from 'calypso/lib/memoize-last';
import StatsEmailModule from 'calypso/my-sites/stats/stats-email-module';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSitePost } from 'calypso/state/posts/selectors';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { PERIOD_ALL_TIME } from 'calypso/state/stats/emails/constants';
import { getEmailStat, isRequestingEmailStats } from 'calypso/state/stats/emails/selectors';
import { getPeriodWithFallback, getCharts } from 'calypso/state/stats/emails/utils';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import DatePicker from '../stats-date-picker';
import StatsDetailsNavigation from '../stats-details-navigation';
import ChartTabs from '../stats-email-chart-tabs';
import StatsEmailTopRow from '../stats-email-top-row';
import { StatsNoContentBanner } from '../stats-no-content-banner';
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
	date: endOf.format( 'YYYY-MM-DD' ),
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
		};
		const possibleBackLinks = {
			traffic: '/stats/day/',
			insights: '/stats/insights/',
			store: '/stats/store/',
			ads: '/stats/ads/',
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
		// Wrap it up!
		return [ { label: backLabel, href: backLink }, { label: title } ];
	};

	componentDidMount() {
		window.scrollTo( 0, 0 );
	}

	getTitle = ( statType ) => pageTitles[ statType ];

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
		} = this.props;
		const { maxBars } = this.state;

		const queryDate = date.format( 'YYYY-MM-DD' );
		const noViewsLabel = translate( 'Your email has not received any views yet!' );

		const { period, endOf } = this.props.period;
		const traffic = {
			label: translate( 'Traffic' ),
			path: `/stats/email/${ statType }`,
		};

		const query = memoizedQuery( period, endOf );
		const slugPath = slug ? `/${ slug }` : '';
		const pathTemplate = `${ traffic.path }/{{ interval }}/${ postId }${ slugPath }`;
		return (
			<>
				<Main className="has-fixed-nav stats__email-detail">
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

					<DocumentHead title={ translate( 'Jetpack Stats' ) } />

					<PageViewTracker
						path="/stats/email/:statType/:site/:period/:email_id"
						title="Stats > Single Email"
					/>

					<FixedNavigationHeader
						navigationItems={ this.getNavigationItemsWithTitle( this.getTitle( statType ) ) }
					></FixedNavigationHeader>

					{ ! isRequestingStats && ! countViews && post && (
						<EmptyContent
							title={ noViewsLabel }
							line={ translate( 'Learn some tips to attract more visitors' ) }
							action={ translate( 'Get more traffic!' ) }
							actionURL="https://wordpress.com/support/getting-more-views-and-traffic/"
							actionTarget="blank"
							illustration="/calypso/images/stats/illustration-stats.svg"
							illustrationWidth={ 150 }
						/>
					) }
					{ post ? (
						<>
							<div className="main-container">
								<h1>{ this.getTitle( statType ) }</h1>

								<StatsDetailsNavigation
									postId={ postId }
									period={ period }
									statType={ statType }
									givenSiteId={ givenSiteId }
								/>

								<StatsEmailTopRow siteId={ siteId } postId={ postId } statType={ statType } />

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
							</div>
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
						</>
					) : (
						<Spinner />
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
		const post = getSitePost( state, siteId, postId );

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
			isRequestingStats: isRequestingEmailStats(
				state,
				siteId,
				postId,
				period,
				statType,
				endOf.format( 'YYYY-MM-DD' )
			),
			siteSlug: getSiteSlug( state, siteId ),
			slug: getSelectedSiteSlug( state ),
			post,
			isSitePrivate: isPrivateSite( state, siteId ),
			siteId,
			period: { period, endOf },
			date,
			hasValidDate,
			showNoDataInfo,
		};
	},
	{ recordGoogleEvent }
);

export default flowRight( connectComponent, localize )( StatsEmailDetail );
