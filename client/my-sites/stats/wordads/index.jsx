import { Icon, chartBar, trendingUp } from '@wordpress/icons';
import classNames from 'classnames';
import { localize, translate, numberFormat } from 'i18n-calypso';
import { find } from 'lodash';
import moment from 'moment';
import page from 'page';
import { stringify as stringifyQs } from 'qs';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import illustration404 from 'calypso/assets/images/illustrations/illustration-404.svg';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import Intervals from 'calypso/blocks/stats-navigation/intervals';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { canAccessWordAds } from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import DatePicker from '../stats-date-picker';
import StatsPeriodHeader from '../stats-period-header';
import StatsPeriodNavigation from '../stats-period-navigation';
import WordAdsChartTabs from '../wordads-chart-tabs';
import WordAdsEarnings from './earnings';
import HighlightsSection from './highlights-section';

import './style.scss';
import 'calypso/my-sites/earn/ads/style.scss';

const formatCurrency = ( value ) => {
	return '$' + numberFormat( value, 2 );
};

const CHARTS = [
	{
		attr: 'impressions',
		legendOptions: [ 'impressions' ],
		icon: (
			<svg
				className="gridicon"
				width="24"
				height="24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="m4 13 .67.336.003-.005a2.42 2.42 0 0 1 .094-.17c.071-.122.18-.302.329-.52.298-.435.749-1.017 1.359-1.598C7.673 9.883 9.498 8.75 12 8.75s4.326 1.132 5.545 2.293c.61.581 1.061 1.163 1.36 1.599a8.29 8.29 0 0 1 .422.689l.002.005L20 13l.67-.336v-.003l-.003-.005-.008-.015-.028-.052a9.752 9.752 0 0 0-.489-.794 11.6 11.6 0 0 0-1.562-1.838C17.174 8.617 14.998 7.25 12 7.25S6.827 8.618 5.42 9.957c-.702.669-1.22 1.337-1.563 1.839a9.77 9.77 0 0 0-.516.845l-.008.015-.002.005-.001.002v.001L4 13Zm8 3a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
					fill="#00101C"
				/>
			</svg>
		),
		label: translate( 'Ads Served' ),
	},
	{
		attr: 'cpm',
		icon: <Icon className="gridicon" icon={ chartBar } />,
		label: translate( 'Average CPM' ),
		format: formatCurrency,
	},
	{
		attr: 'revenue',
		icon: <Icon className="gridicon" icon={ trendingUp } />,
		label: translate( 'Revenue' ),
		format: formatCurrency,
	},
];

const getActiveTab = ( chartTab ) => find( CHARTS, { attr: chartTab } ) || CHARTS[ 0 ];

class WordAds extends Component {
	static defaultProps = {
		chartTab: 'impressions',
	};

	// getDerivedStateFromProps will set the state both on init and tab switch
	state = {
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

	barClick = ( bar ) => {
		this.props.recordGoogleEvent( 'WordAds Stats', 'Clicked Chart Bar' );
		const updatedQs = stringifyQs( { ...this.props.context.query, startDate: bar.data.period } );

		page.redirect( `${ this.props.context.pathname }?${ updatedQs }` );
	};

	onChangeLegend = ( activeLegend ) => this.setState( { activeLegend } );

	switchChart = ( tab ) => {
		if ( ! tab.loading && tab.attr !== this.state.chartTab ) {
			this.props.recordGoogleEvent( 'WordAds Stats', 'Clicked ' + titlecase( tab.attr ) + ' Tab' );
			// switch the tab by navigating to route with updated query string
			const updatedQs = stringifyQs( { ...this.props.context.query, tab: tab.attr } );
			page.show( `${ this.props.context.pathname }?${ updatedQs }` );
		}
	};

	isPrevArrowHidden = ( period, queryDate ) => {
		return (
			[ 'day', 'week' ].includes( period ) && moment( queryDate ).isSameOrBefore( '2018-10-01' )
		);
	};

	render() {
		const { canAccessAds, canUpgradeToUseWordAds, date, site, siteId, slug } = this.props;

		const { period, endOf } = this.props.period;

		const yesterday = moment.utc().subtract( 1, 'days' ).format( 'YYYY-MM-DD' );

		// Never show stats for the current day. Stats are fetched nightly for the previous day.
		const queryDate = date.isSameOrAfter( yesterday ) ? yesterday : date.format( 'YYYY-MM-DD' );

		const query = {
			period,
			date: endOf.format( 'YYYY-MM-DD' ),
		};

		// For period option links
		const wordads = {
			label: 'Ads',
			path: '/stats/ads',
		};

		const slugPath = slug ? `/${ slug }` : '';
		const pathTemplate = `${ wordads.path }/{{ interval }}${ slugPath }`;

		const statsWrapperClass = classNames( 'wordads stats-content', {
			'is-period-year': period === 'year',
		} );

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Main fullWidthLayout>
				<DocumentHead title={ translate( 'WordAds Stats' ) } />
				<PageViewTracker
					path={ `/stats/ads/${ period }/:site` }
					title={ `WordAds > ${ titlecase( period ) }` }
				/>

				<div className="stats">
					<FormattedHeader
						brandFont
						className="stats__section-header modernized-header"
						headerText={ translate( 'Jetpack Stats' ) }
						subHeaderText={ translate( 'See how ads are performing on your site.' ) }
						align="left"
					/>

					{ ! canAccessAds && (
						<EmptyContent
							illustration={ illustration404 }
							title={
								! canUpgradeToUseWordAds
									? translate( 'You are not authorized to view this page' )
									: translate( 'WordAds is not enabled on your site' )
							}
							action={ canUpgradeToUseWordAds ? translate( 'Explore WordAds' ) : false }
							actionURL={ '/earn/ads-settings/' + slug }
						/>
					) }

					{ canAccessAds && (
						<Fragment>
							<StatsNavigation
								selectedItem="wordads"
								interval={ period }
								siteId={ siteId }
								slug={ slug }
							/>

							<HighlightsSection siteId={ siteId } />

							<div id="my-stats-content" className={ statsWrapperClass }>
								<>
									<StatsPeriodHeader>
										<StatsPeriodNavigation
											date={ queryDate }
											hidePreviousArrow={ this.isPrevArrowHidden( period, queryDate ) }
											hideNextArrow={ yesterday === queryDate }
											period={ period }
											url={ `/stats/ads/${ period }/${ slug }` }
										>
											<DatePicker
												period={ period }
												date={ queryDate }
												query={ query }
												statsType="statsAds"
												showQueryDate
												isShort
											/>
										</StatsPeriodNavigation>
										<Intervals
											selected={ period }
											pathTemplate={ pathTemplate }
											compact={ false }
										/>
									</StatsPeriodHeader>

									<WordAdsChartTabs
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
									/>
								</>

								<div className="stats__module-list stats__module-headerless--unified">
									<WordAdsEarnings site={ site } />
								</div>
							</div>

							<JetpackColophon />
						</Fragment>
					) }
				</div>
			</Main>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect(
	( state ) => {
		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state );
		return {
			site,
			siteId,
			slug: getSelectedSiteSlug( state ),
			canAccessAds: canAccessWordAds( state, siteId ),
			canUpgradeToUseWordAds: canCurrentUser( state, siteId, 'manage_options' ),
		};
	},
	{ recordGoogleEvent }
)( localize( WordAds ) );
