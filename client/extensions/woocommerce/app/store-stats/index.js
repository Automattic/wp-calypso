/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import Chart from './store-stats-orders-chart';
import StatsPeriodNavigation from 'calypso/my-sites/stats/stats-period-navigation';
import DatePicker from 'calypso/my-sites/stats/stats-date-picker';
import FormattedHeader from 'calypso/components/formatted-header';
import Module from './store-stats-module';
import List from './store-stats-list';
import WidgetList from './store-stats-widget-list';
import SectionHeader from 'calypso/components/section-header';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import {
	sparkWidgets,
	topProducts,
	topCategories,
	topCoupons,
	noDataMsg,
} from 'woocommerce/app/store-stats/constants';
import { getEndPeriod, getQueries, getWidgetPath } from './utils';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import config from '@automattic/calypso-config';
import StoreStatsReferrerWidget from './store-stats-referrer-widget';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import titlecase from 'to-title-case';

class StoreStats extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		queryDate: PropTypes.string,
		queryParams: PropTypes.object.isRequired,
		selectedDate: PropTypes.string,
		siteId: PropTypes.number,
		unit: PropTypes.string.isRequired,
	};

	render() {
		const { queryDate, selectedDate, siteId, slug, unit, queryParams, translate } = this.props;
		const endSelectedDate = getEndPeriod( selectedDate, unit );
		const { orderQuery, referrerQuery } = getQueries( unit, queryDate );
		const { topListQuery } = getQueries( unit, selectedDate );
		const topWidgets = [ topProducts, topCategories, topCoupons ];
		const widgetPath = getWidgetPath( unit, slug, queryParams );

		return (
			<Main className="store-stats woocommerce" wideLayout>
				<PageViewTracker
					path={ `/store/stats/orders/${ unit }/:site` }
					title={ `Store > Stats > Orders > ${ titlecase( unit ) }` }
				/>
				{ siteId && (
					<QuerySiteStats statType="statsOrders" siteId={ siteId } query={ orderQuery } />
				) }
				<SidebarNavigation />
				<FormattedHeader
					brandFont
					className="store-stats__section-header"
					headerText={ translate( 'Stats and Insights' ) }
					align="left"
					subHeaderText={ translate(
						'Learn valuable insights about the purchases made on your store.'
					) }
				/>
				<StatsNavigation
					selectedItem={ 'store' }
					siteId={ siteId }
					slug={ slug }
					interval={ unit }
				/>
				<Chart
					query={ orderQuery }
					selectedDate={ endSelectedDate }
					siteId={ siteId }
					unit={ unit }
					slug={ slug }
				/>
				<StatsPeriodNavigation
					date={ selectedDate }
					period={ unit }
					url={ `/store/stats/orders/${ unit }/${ slug }` }
				>
					<DatePicker
						period={ unit }
						// this is needed to counter the +1d adjustment made in DatePicker for weeks
						date={
							unit === 'week'
								? moment( selectedDate, 'YYYY-MM-DD' ).subtract( 1, 'days' ).format( 'YYYY-MM-DD' )
								: selectedDate
						}
						query={ orderQuery }
						statsType="statsOrders"
						showQueryDate
					/>
				</StatsPeriodNavigation>
				{ config.isEnabled( 'woocommerce/extension-referrers' ) && (
					<div>
						{ siteId && (
							<QuerySiteStats
								statType="statsStoreReferrers"
								siteId={ siteId }
								query={ referrerQuery }
							/>
						) }
						<Module
							siteId={ siteId }
							emptyMessage={ noDataMsg }
							query={ referrerQuery }
							statType="statsStoreReferrers"
							header={
								<SectionHeader
									href={ `/store/stats/referrers${ widgetPath }` }
									label={ 'Store Referrers' }
								/>
							}
						>
							<StoreStatsReferrerWidget
								unit={ unit }
								queryParams={ queryParams }
								slug={ slug }
								siteId={ siteId }
								query={ referrerQuery }
								statType="statsStoreReferrers"
								endSelectedDate={ endSelectedDate }
								limit={ 5 }
								pageType="orders"
							/>
						</Module>
					</div>
				) }
				<div className="store-stats__widgets">
					{ sparkWidgets.map( ( widget, index ) => (
						<div className="store-stats__widgets-column widgets" key={ index }>
							<Module
								siteId={ siteId }
								emptyMessage={ noDataMsg }
								query={ orderQuery }
								statType="statsOrders"
							>
								<WidgetList
									siteId={ siteId }
									query={ orderQuery }
									selectedDate={ endSelectedDate }
									statType="statsOrders"
									widgets={ widget }
								/>
							</Module>
						</div>
					) ) }
					{ topWidgets.map( ( widget ) => {
						const header = (
							<SectionHeader href={ widget.basePath + widgetPath } label={ widget.title } />
						);
						return (
							<div className="store-stats__widgets-column" key={ widget.basePath }>
								{ siteId && (
									<QuerySiteStats
										statType={ widget.statType }
										siteId={ siteId }
										query={ topListQuery }
									/>
								) }
								<Module
									siteId={ siteId }
									header={ header }
									emptyMessage={ widget.empty }
									query={ topListQuery }
									statType={ widget.statType }
								>
									<List
										siteId={ siteId }
										values={ widget.values }
										query={ topListQuery }
										statType={ widget.statType }
									/>
								</Module>
							</div>
						);
					} ) }
				</div>
				<JetpackColophon />
			</Main>
		);
	}
}

export default connect( ( state ) => ( {
	slug: getSelectedSiteSlug( state ),
	siteId: getSelectedSiteId( state ),
} ) )( localize( StoreStats ) );
