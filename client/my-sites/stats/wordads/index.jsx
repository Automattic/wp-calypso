/**
 * External dependencies
 */

import page from 'page';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize, translate, numberFormat } from 'i18n-calypso';
import { parse as parseQs, stringify as stringifyQs } from 'qs';
import { find } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import EmptyContent from 'components/empty-content';
import StatsNavigation from 'blocks/stats-navigation';
import StatsPeriodNavigation from '../stats-period-navigation';
import DatePicker from '../stats-date-picker';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import WordAdsChartTabs from '../wordads-chart-tabs';
import titlecase from 'to-title-case';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import JetpackColophon from 'components/jetpack-colophon';
import WordAdsEarnings from './earnings';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { canCurrentUserUseAds } from 'state/sites/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import { recordGoogleEvent } from 'state/analytics/actions';
import PrivacyPolicyBanner from 'blocks/privacy-policy-banner';
import StickyPanel from 'components/sticky-panel';

/**
 * Style dependencies
 */
import './style.scss';
import 'my-sites/earn/ads/style.scss';

function updateQueryString( query = {} ) {
	return {
		...parseQs( window.location.search.substring( 1 ) ),
		...query,
	};
}

const formatCurrency = ( value ) => {
	return '$' + numberFormat( value, 2 );
};

const CHARTS = [
	{
		attr: 'impressions',
		legendOptions: [ 'impressions' ],
		gridicon: 'visible',
		label: translate( 'Ads Served' ),
	},
	{
		attr: 'cpm',
		gridicon: 'stats-alt',
		label: translate( 'Average CPM' ),
		format: formatCurrency,
	},
	{
		attr: 'revenue',
		gridicon: 'money',
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
		const updatedQs = stringifyQs( updateQueryString( { startDate: bar.data.period } ) );
		page.redirect( `${ window.location.pathname }?${ updatedQs }` );
	};

	onChangeLegend = ( activeLegend ) => this.setState( { activeLegend } );

	switchChart = ( tab ) => {
		if ( ! tab.loading && tab.attr !== this.state.chartTab ) {
			this.props.recordGoogleEvent( 'WordAds Stats', 'Clicked ' + titlecase( tab.attr ) + ' Tab' );
			// switch the tab by navigating to route with updated query string
			const updatedQs = stringifyQs( updateQueryString( { tab: tab.attr } ) );
			page.show( `${ window.location.pathname }?${ updatedQs }` );
		}
	};

	render() {
		const { canAccessAds, date, isAdmin, site, siteId, slug } = this.props;

		const { period, endOf } = this.props.period;

		const yesterday = moment.utc().subtract( 1, 'days' ).format( 'YYYY-MM-DD' );

		// Never show stats for the current day. Stats are fetched nightly for the previous day.
		const queryDate = date.isSameOrAfter( yesterday ) ? yesterday : date.format( 'YYYY-MM-DD' );

		const query = {
			period,
			date: endOf.format( 'YYYY-MM-DD' ),
		};

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Main wideLayout={ true }>
				<DocumentHead title={ translate( 'WordAds Stats' ) } />
				<PageViewTracker
					path={ `/stats/ads/${ period }/:site` }
					title={ `WordAds > ${ titlecase( period ) }` }
				/>
				<PrivacyPolicyBanner />
				<SidebarNavigation />
				<FormattedHeader
					className="wordads__section-header"
					headerText={ translate( 'Stats and Insights' ) }
					align="left"
				/>
				{ ! canAccessAds && (
					<EmptyContent
						illustration="/calypso/images/illustrations/illustration-404.svg"
						title={
							! isAdmin
								? translate( 'You are not authorized to view this page' )
								: translate( 'WordAds is not enabled on your site' )
						}
						action={ isAdmin ? translate( 'Explore WordAds' ) : false }
						actionURL={ '/earn/ads-settings/' + slug }
					/>
				) }
				{ canAccessAds && (
					<Fragment>
						<StatsNavigation
							selectedItem={ 'wordads' }
							interval={ period }
							siteId={ siteId }
							slug={ slug }
						/>
						<div id="my-stats-content" className="wordads">
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
							<StickyPanel className="stats__sticky-navigation">
								<StatsPeriodNavigation
									date={ queryDate }
									hidePreviousArrow={
										( 'day' === period || 'week' === period ) &&
										moment( queryDate ).isSameOrBefore( '2018-10-01' )
									} // @TODO is there a more elegant way to do this? Similar to in_array() for php?
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
									/>
								</StatsPeriodNavigation>
							</StickyPanel>
							<div className="stats__module-list">
								<WordAdsEarnings site={ site } />
							</div>
						</div>

						<JetpackColophon />
					</Fragment>
				) }
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
			canAccessAds: canCurrentUserUseAds( state, siteId ),
			isAdmin: canCurrentUser( state, siteId, 'manage_options' ),
		};
	},
	{ recordGoogleEvent }
)( localize( WordAds ) );
