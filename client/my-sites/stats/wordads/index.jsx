/** @format */

/**
 * External dependencies
 */

import page from 'page';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize, numberFormat } from 'i18n-calypso';
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

class WordAds extends Component {
	state = {
		chartTab: this.props.chartTab,
		tabSwitched: false,
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		// @TODO update
		if ( ! this.state.tabSwitched && this.state.chartTab !== nextProps.chartTab ) {
			this.setState( {
				tabSwitched: true,
				chartTab: nextProps.chartTab,
			} );
		}
	}

	barClick = bar => {
		this.props.recordGoogleEvent( 'Stats', 'Clicked Chart Bar' );
		page.redirect( this.props.path + '?startDate=' + bar.data.period );
	};

	switchChart = tab => {
		if ( ! tab.loading && tab.attr !== this.state.chartTab ) {
			this.props.recordGoogleEvent( 'Stats', 'Clicked ' + titlecase( tab.attr ) + ' Tab' );
			this.setState( {
				chartTab: tab.attr,
				tabSwitched: true,
			} );
		}
	};

	formatCurrency = value => {
		return '$' + numberFormat( value, 2 );
	};

	render() {
		const { date, site, siteId, slug, translate } = this.props;

		const charts = [
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
				format: this.formatCurrency,
			},
			{
				attr: 'revenue',
				gridicon: 'money',
				label: translate( 'Revenue' ),
				format: this.formatCurrency,
			},
		];

		const { period } = this.props.period;

		const today = moment().format( 'YYYY-MM-DD' );
		const yesterday = moment()
			.subtract( 1, 'days' )
			.format( 'YYYY-MM-DD' );

		const queryDate = today === date.format( 'YYYY-MM-DD' ) ? yesterday : today;

		const query = {
			period: period,
			date: queryDate,
		};

		return (
			<Main wideLayout={ true }>
				{ /*
				<QueryKeyringConnections />
				{ siteId && <QuerySiteKeyrings siteId={ siteId } /> }
*/ }
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
						barClick={ this.barClick }
						switchTab={ this.switchChart }
						charts={ charts }
						queryDate={ queryDate }
						period={ this.props.period }
						chartTab={ this.state.chartTab }
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
