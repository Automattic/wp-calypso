import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { eye } from '@automattic/components/src/icons';
import { formatNumber } from '@automattic/number-formatters';
import { Icon, chartBar, trendingUp } from '@wordpress/icons';
import clsx from 'clsx';
import { localize, translate } from 'i18n-calypso';
import { find } from 'lodash';
import moment from 'moment';
import { stringify as stringifyQs } from 'qs';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import { navItems } from 'calypso/blocks/stats-navigation/constants';
import Intervals from 'calypso/blocks/stats-navigation/intervals';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import PageHeader from 'calypso/my-sites/stats/components/headers/page-header';
import Main from 'calypso/my-sites/stats/components/stats-main';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { canAccessWordAds } from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import PromoCards from '../promo-cards';
import DatePicker from '../stats-date-picker';
import PageViewTracker from '../stats-page-view-tracker';
import StatsPeriodHeader from '../stats-period-header';
import StatsPeriodNavigation from '../stats-period-navigation';
import WordAdsChartTabs from '../wordads-chart-tabs';
import WordAdsEarnings from './earnings';
import HighlightsSection from './highlights-section';

import './style.scss';
import 'calypso/my-sites/earn/ads/style.scss';

const formatCurrency = ( value ) => {
	return '$' + formatNumber( value, { decimals: 2 } );
};

const CHARTS = [
	{
		attr: 'impressions',
		legendOptions: [ 'impressions' ],
		icon: <Icon className="gridicon" icon={ eye } />,
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

/**
 * Define chart properties with translatable string getters
 * so that they can be translated on the fly. Without this,
 * you'd have to reload the page in certain instances
 * to see the translated strings.
 */
Object.defineProperty( CHARTS[ 0 ], 'label', {
	get: () => translate( 'Ads Served' ),
} );

Object.defineProperty( CHARTS[ 1 ], 'label', {
	get: () => translate( 'Average CPM' ),
} );

Object.defineProperty( CHARTS[ 2 ], 'label', {
	get: () => translate( 'Revenue' ),
} );

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
		const { canAccessAds, canUpgradeToUseWordAds, date, isOdysseyStats, site, siteId, slug } =
			this.props;

		const { period, endOf } = this.props.period;

		const yesterday = moment.utc().subtract( 1, 'days' ).format( 'YYYY-MM-DD' );

		// Never show stats for the current day. Stats are fetched nightly for the previous day.
		const queryDate = date.isSameOrAfter( yesterday ) ? yesterday : date.format( 'YYYY-MM-DD' );

		const query = {
			period,
			date: endOf.format( 'YYYY-MM-DD' ),
		};

		const wordads = navItems.wordads;
		const slugPath = slug ? `/${ slug }` : '';
		const pathTemplate = `${ wordads.path }/{{ interval }}${ slugPath }`;

		const isWPAdmin = config.isEnabled( 'is_odyssey' );
		const wordAdsPageClasses = clsx( 'stats', { 'is-odyssey-stats': isWPAdmin } );

		const statsWrapperClass = clsx( 'wordads stats-content', {
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

				<div className={ wordAdsPageClasses }>
					<PageHeader />

					{ ! canAccessAds && (
						<EmptyContent
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

							<PromoCards isOdysseyStats={ isOdysseyStats } pageSlug="ads" slug={ slug } />

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
		const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
		return {
			isOdysseyStats,
			site,
			siteId,
			slug: getSelectedSiteSlug( state ),
			canAccessAds: canAccessWordAds( state, siteId ),
			canUpgradeToUseWordAds: canCurrentUser( state, siteId, 'manage_options' ),
		};
	},
	{ recordGoogleEvent }
)( localize( WordAds ) );
