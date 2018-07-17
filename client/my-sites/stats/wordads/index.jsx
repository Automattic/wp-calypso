/** @format */

/**
 * External dependencies
 */

import page from 'page';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import StatsNavigation from 'blocks/stats-navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import WordAdsChartTabs from '../wordads-chart-tabs';
import StatsPeriodNavigation from '../stats-period-navigation'; // @TODO remove?
import DatePicker from '../stats-date-picker'; // @TODO remove?
import statsStrings from '../stats-strings'; // @TODO remove
import titlecase from 'to-title-case';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import StickyPanel from 'components/sticky-panel';
import JetpackColophon from 'components/jetpack-colophon';
import config from 'config';
import AdsEarnings from 'my-sites/ads/form-earnings';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getSiteOption, isJetpackSite } from 'state/sites/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';
import PrivacyPolicyBanner from 'blocks/privacy-policy-banner';
import QuerySiteKeyrings from 'components/data/query-site-keyrings'; // @TODO update
import QueryKeyringConnections from 'components/data/query-keyring-connections'; // @TODO update

class WordAds extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			chartTab: this.props.chartTab,
			tabSwitched: false,
		};
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
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

	render() {
		const { date, isJetpack, site, siteId, slug, translate } = this.props;

		const charts = [
			{
				attr: 'ads-shown',
				legendOptions: [ 'ads-shown' ],
				gridicon: 'visible',
				label: translate( 'Ads Shown', { context: 'noun' } ),
			},
			{
				attr: 'ads-per-page',
				gridicon: 'reader',
				label: translate( 'Ads Per Page', { context: 'noun' } ),
			},
			{
				attr: 'cpm',
				gridicon: 'stats-alt',
				label: translate( 'CPM', { context: 'noun' } ),
			},
			{
				attr: 'revenue',
				gridicon: 'money',
				label: translate( 'Revenue', { context: 'noun' } ),
			},
		];
		const queryDate = date.format( 'YYYY-MM-DD' );
		const { period, endOf } = this.props.period;
		const moduleStrings = statsStrings();

		const query = {
			period: period,
			date: endOf.format( 'YYYY-MM-DD' ),
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
				<div id="my-stats-content">
					<WordAdsChartTabs
						barClick={ this.barClick }
						switchTab={ this.switchChart }
						charts={ charts }
						queryDate={ queryDate }
						period={ this.props.period }
						chartTab={ this.state.chartTab }
					/>
					{ /*
					<StickyPanel className="stats__sticky-navigation">
						<StatsPeriodNavigation
							date={ date }
							period={ period }
							url={ `/stats/${ period }/${ slug }` }
						>
							<DatePicker
								period={ period }
								date={ date }
								query={ query }
								statsType="statsTopPosts"
								showQueryDate
							/>
						</StatsPeriodNavigation>
					</StickyPanel>
*/ }
					<div className="stats__module-list">
						<AdsEarnings site={ this.props.site } />
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
		const isJetpack = isJetpackSite( state, siteId );
		return {
			isJetpack,
			site,
			siteId,
			slug: getSelectedSiteSlug( state ),
		};
	},
	{ recordGoogleEvent }
)( localize( WordAds ) );
