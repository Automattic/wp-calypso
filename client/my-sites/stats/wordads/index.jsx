/** @format */

/**
 * External dependencies
 */

import page from 'page';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize, translate, numberFormat } from 'i18n-calypso';
import { parse as parseQs, stringify as stringifyQs } from 'qs';
import { find, memoize } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import StatsNavigation from 'blocks/stats-navigation';
import StatsPeriodNavigation from '../stats-period-navigation';
import DatePicker from '../stats-date-picker';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import WordAdsChartTabs from '../wordads-chart-tabs';
import titlecase from 'to-title-case';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import JetpackColophon from 'components/jetpack-colophon';
import WordAdsEarnings from './earnings';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';
import PrivacyPolicyBanner from 'blocks/privacy-policy-banner';
import StickyPanel from 'components/sticky-panel';

/**
 * Style dependencies
 */
import './style.scss';

function updateQueryString( query = {} ) {
	return {
		...parseQs( window.location.search.substring( 1 ) ),
		...query,
	};
}

const formatCurrency = value => {
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

class WordAds extends Component {
	static defaultProps = {
		chartTab: 'impressions',
	};

	constructor( props ) {
		super( props );
		const activeTab = this.getActiveTab( this.props.chartTab );
		this.state = {
			activeLegend: activeTab.legendOptions ? activeTab.legendOptions.slice() : [],
		};
	}
	getActiveTab = memoize( chartTab => find( CHARTS, { attr: chartTab } ) || CHARTS[ 0 ] );

	getAvailableLegend() {
		const activeTab = this.getActiveTab( this.props.chartTab );
		return activeTab.legendOptions ? activeTab.legendOptions.slice() : [];
	}

	barClick = bar => {
		this.props.recordGoogleEvent( 'WordAds Stats', 'Clicked Chart Bar' );
		const updatedQs = stringifyQs( updateQueryString( { startDate: bar.data.period } ) );
		page.redirect( `${ window.location.pathname }?${ updatedQs }` );
	};

	onChangeLegend = activeLegend => this.setState( { activeLegend } );

	switchChart = tab => {
		if ( ! tab.loading && tab.attr !== this.state.chartTab ) {
			this.props.recordGoogleEvent( 'WordAds Stats', 'Clicked ' + titlecase( tab.attr ) + ' Tab' );
			const originalTab = find( CHARTS, { attr: tab.attr } );
			const activeLegend = originalTab.legendOptions ? originalTab.legendOptions.slice() : [];
			this.setState( { activeLegend }, () => {
				const updatedQs = stringifyQs( updateQueryString( { tab: tab.attr } ) );
				page.show( `${ window.location.pathname }?${ updatedQs }` );
			} );
		}
	};

	render() {
		const { date, site, siteId, slug } = this.props;

		const { period, endOf } = this.props.period;

		const yesterday = moment
			.utc()
			.subtract( 1, 'days' )
			.format( 'YYYY-MM-DD' );

		// Never show stats for the current day. Stats are fetched nightly for the previous day.
		const queryDate = date.isSameOrAfter( yesterday ) ? yesterday : date.format( 'YYYY-MM-DD' );

		const query = {
			period,
			date: endOf.format( 'YYYY-MM-DD' ),
		};

		return (
			<Main wideLayout={ true }>
				<DocumentHead title={ translate( 'WordAds Stats' ) } />
				<PageViewTracker
					path={ `/stats/wordads/${ period }/:site` }
					title={ `WordAds > ${ titlecase( period ) }` }
				/>
				<PrivacyPolicyBanner />
				<SidebarNavigation />
				<StatsNavigation
					selectedItem={ 'wordads' }
					interval={ period }
					siteId={ siteId }
					slug={ slug }
				/>
				<div id="my-stats-content" className="wordads">
					<WordAdsChartTabs
						activeLegend={ this.state.activeLegend }
						activeTab={ this.getActiveTab( this.props.chartTab ) }
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
							url={ `/stats/wordads/${ period }/${ slug }` }
						>
							<DatePicker
								period={ period }
								date={ queryDate }
								query={ query }
								statsType="statsTopPosts"
								showQueryDate
							/>
						</StatsPeriodNavigation>
					</StickyPanel>
					<div className="stats__module-list">
						<WordAdsEarnings site={ site } />
					</div>
				</div>

				<JetpackColophon />
			</Main>
		);
	}
}

export default connect(
	state => {
		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state );
		return {
			site,
			siteId,
			slug: getSelectedSiteSlug( state ),
		};
	},
	{ recordGoogleEvent }
)( localize( WordAds ) );
