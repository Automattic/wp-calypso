import { getUrlParts } from '@automattic/calypso-url';
import { Icon, people } from '@wordpress/icons';
import { localize, translate } from 'i18n-calypso';
import { flowRight } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { parse as parseQs, stringify as stringifyQs } from 'qs';
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
import { decodeEntities, stripHTML } from 'calypso/lib/formatting';
import memoizeLast from 'calypso/lib/memoize-last';
import StatsEmailModule from 'calypso/my-sites/stats/stats-email-module';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import {
	getSiteOption,
	getSiteSlug,
	isJetpackSite,
	isSitePreviewable,
} from 'calypso/state/sites/selectors';
import {
	getEmailStat,
	getSiteEmail,
	isRequestingEmailStats,
} from 'calypso/state/stats/emails/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import DatePicker from '../stats-date-picker';
import ChartTabs from '../stats-email-chart-tabs';
import { StatsNoContentBanner } from '../stats-no-content-banner';
import StatsPeriodHeader from '../stats-period-header';
import StatsPeriodNavigation from '../stats-period-navigation';
import './style.scss';

function getPageUrl() {
	return getUrlParts( page.current );
}

function updateQueryString( url = null, query = {} ) {
	let search = window.location.search;
	if ( url ) {
		search = url.search;
	}

	return {
		...parseQs( search.substring( 1 ) ),
		...query,
	};
}

const CHART_OPENS = {
	attr: 'opens_count',
	legendOptions: [],
	icon: (
		<svg className="gridicon" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="m4 13 .67.336.003-.005a2.42 2.42 0 0 1 .094-.17c.071-.122.18-.302.329-.52.298-.435.749-1.017 1.359-1.598C7.673 9.883 9.498 8.75 12 8.75s4.326 1.132 5.545 2.293c.61.581 1.061 1.163 1.36 1.599a8.29 8.29 0 0 1 .422.689l.002.005L20 13l.67-.336v-.003l-.003-.005-.008-.015-.028-.052a9.752 9.752 0 0 0-.489-.794 11.6 11.6 0 0 0-1.562-1.838C17.174 8.617 14.998 7.25 12 7.25S6.827 8.618 5.42 9.957c-.702.669-1.22 1.337-1.563 1.839a9.77 9.77 0 0 0-.516.845l-.008.015-.002.005-.001.002v.001L4 13Zm8 3a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
				fill="#00101C"
			/>
		</svg>
	),
	label: translate( 'Opens', { context: 'noun' } ),
};
const CHART_UNIQUE_OPENS = {
	attr: 'unique_opens_count',
	icon: <Icon className="gridicon" icon={ people } />,
	label: translate( 'Unique opens', { context: 'noun' } ),
};
const CHARTS = [ CHART_OPENS, CHART_UNIQUE_OPENS ];
Object.defineProperty( CHART_OPENS, 'label', {
	get: () => translate( 'Opens', { context: 'noun' } ),
} );
Object.defineProperty( CHART_UNIQUE_OPENS, 'label', {
	get: () => translate( 'Unique opens', { context: 'noun' } ),
} );

const getActiveTab = ( chartTab ) => find( CHARTS, { attr: chartTab } ) || CHARTS[ 0 ];

const memoizedQuery = memoizeLast( ( period, endOf ) => ( {
	period,
	date: endOf.format( 'YYYY-MM-DD' ),
} ) );

const statType = 'opens';

class StatsEmailOpenDetail extends Component {
	static propTypes = {
		path: PropTypes.string,
		siteId: PropTypes.number,
		postId: PropTypes.number,
		translate: PropTypes.func,
		context: PropTypes.object,
		isRequestingStats: PropTypes.bool,
		countViews: PropTypes.array,
		email: PropTypes.object,
		siteSlug: PropTypes.string,
		showViewLink: PropTypes.bool,
		previewUrl: PropTypes.string,
	};

	state = {
		showPreview: false,
		activeTab: null,
		activeLegend: null,
	};

	static getDerivedStateFromProps( props, state ) {
		// when switching from one tab to another or when initializing the component,
		// reset the active legend charts to the defaults for that tab. The legends
		// can be then toggled on and off by the user in `onLegendClick`.
		const activeTab = getActiveTab( props.chartTab );
		if ( activeTab !== state.activeTab ) {
			return {
				activeTab,
				activeLegend: activeTab.legendOptions || [],
			};
		}
		return null;
	}

	getAvailableLegend() {
		const activeTab = getActiveTab( this.props.chartTab );
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

	getTitle() {
		const { isLatestEmailsHomepage, email, emailFallback } = this.props;

		if ( isLatestEmailsHomepage ) {
			return this.props.translate( 'Home page / Archives' );
		}

		if ( typeof email?.title === 'string' && email.title.length ) {
			return decodeEntities( stripHTML( email.title ) );
		}

		if ( typeof emailFallback?.email_title === 'string' && emailFallback.email_title.length ) {
			return decodeEntities( stripHTML( emailFallback.email_title ) );
		}

		return null;
	}

	onChangeLegend = ( activeLegend ) => this.setState( { activeLegend } );

	barClick = ( bar ) => {
		this.props.recordGoogleEvent( 'Stats', 'Clicked Chart Bar' );
		const parsed = getPageUrl();
		const updatedQs = stringifyQs( updateQueryString( parsed, { startDate: bar.data.period } ) );
		page.redirect( `${ parsed.pathname }?${ updatedQs }` );
	};

	switchChart = ( tab ) => {
		if ( ! tab.loading && tab.attr !== this.props.chartTab ) {
			this.props.recordGoogleEvent( 'Stats', 'Clicked ' + titlecase( tab.attr ) + ' Tab' );
			// switch the tab by navigating to route with updated query string
			const updatedQs = stringifyQs( updateQueryString( getPageUrl(), { tab: tab.attr } ) );
			page.show( `${ getPageUrl().pathname }?${ updatedQs }` );
		}
	};

	render() {
		const { isRequestingStats, countViews, postId, siteId, date, slug, isSitePrivate } = this.props;

		const queryDate = date.format( 'YYYY-MM-DD' );
		const noViewsLabel = translate( 'Your email has not received any views yet!' );

		const { period, endOf } = this.props.period;
		const traffic = {
			label: translate( 'Traffic' ),
			path: '/stats/email/open',
		};
		const query = memoizedQuery( period, endOf );
		const slugPath = slug ? `/${ slug }` : '';
		const pathTemplate = `${ traffic.path }${ slugPath }/{{ interval }}/${ postId }`;

		return (
			<Main className="has-fixed-nav stats__email-opens" wideLayout>
				<DocumentHead title={ translate( 'Jetpack Stats' ) } />
				<QueryEmailStats
					siteId={ siteId }
					postId={ postId }
					date={ query.date }
					period={ query.period }
				/>
				<PageViewTracker
					path="/stats/email/open/:site/:period/:email_id"
					title="Stats > Single Email"
				/>

				<FixedNavigationHeader
					navigationItems={ this.getNavigationItemsWithTitle( this.getTitle() ) }
				/>

				{ ! isRequestingStats && ! countViews && (
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

				<div>
					<>
						<StatsPeriodHeader>
							<StatsPeriodNavigation
								date={ date }
								period={ period }
								url={ `/stats/email/open/${ slug }/${ period }/${ postId }` }
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
								intervalValues={ emailIntervals }
								compact={ false }
							/>
						</StatsPeriodHeader>

						<ChartTabs
							activeTab={ getActiveTab( this.props.chartTab ) }
							activeLegend={ this.state.activeLegend }
							availableLegend={ this.getAvailableLegend() }
							onChangeLegend={ this.onChangeLegend }
							barClick={ this.barClick }
							switchTab={ this.switchChart }
							charts={ CHARTS }
							queryDate={ queryDate }
							period={ this.props.period }
							chartTab={ this.props.chartTab }
							postId={ postId }
							statType={ statType }
						/>

						{ isSitePrivate ? this.renderPrivateSiteBanner( siteId, slug ) : null }
						{ ! isSitePrivate && <StatsNoContentBanner siteId={ siteId } siteSlug={ slug } /> }
					</>
				</div>

				<div className="stats__module-list">
					<StatsEmailModule
						path="countries"
						statType="opens"
						postId={ postId }
						siteId={ siteId }
						period={ period }
						date={ queryDate }
					/>

					<StatsEmailModule
						path="devices"
						statType="opens"
						postId={ postId }
						siteId={ siteId }
						period={ period }
						date={ queryDate }
					/>

					<StatsEmailModule
						path="clients"
						statType="opens"
						postId={ postId }
						siteId={ siteId }
						period={ period }
						date={ queryDate }
					/>
				</div>
			</Main>
		);
	}
}

const connectComponent = connect(
	( state, { postId, period: { period } } ) => {
		const siteId = getSelectedSiteId( state );
		const isJetpack = isJetpackSite( state, siteId );
		const isPreviewable = isSitePreviewable( state, siteId );
		const isLatestEmailsHomepage =
			getSiteOption( state, siteId, 'show_on_front' ) === 'email' && postId === 0;

		return {
			email: getSiteEmail( state, siteId, postId ),
			emailFallback: getEmailStat( state, siteId, postId, 'email' ),
			isLatestEmailsHomepage,
			countViews: getEmailStat( state, siteId, postId, period, statType ),
			isRequestingStats: isRequestingEmailStats( state, siteId, postId, period, statType ),
			siteSlug: getSiteSlug( state, siteId ),
			showViewLink: ! isJetpack && ! isLatestEmailsHomepage && isPreviewable,
			slug: getSelectedSiteSlug( state ),
			isSitePrivate: isPrivateSite( state, siteId ),
			siteId,
		};
	},
	{ recordGoogleEvent }
);

export default flowRight( connectComponent, localize )( StatsEmailOpenDetail );
