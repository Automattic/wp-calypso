/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { moment, translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import StatsNavigation from 'blocks/stats-navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import Chart from './store-stats-chart';
import StatsPeriodNavigation from 'my-sites/stats/stats-period-navigation';
import DatePicker from 'my-sites/stats/stats-date-picker';
import Module from './store-stats-module';
import List from './store-stats-list';
import WidgetList from './store-stats-widget-list';
import SectionHeader from 'components/section-header';
import JetpackColophon from 'components/jetpack-colophon';
import {
	sparkWidgets,
	topProducts,
	topCategories,
	topCoupons,
	UNITS,
} from 'woocommerce/app/store-stats/constants';
import { getUnitPeriod, getEndPeriod } from './utils';
import QuerySiteStats from 'components/data/query-site-stats';

class StoreStats extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		queryDate: PropTypes.string,
		querystring: PropTypes.string,
		selectedDate: PropTypes.string,
		siteId: PropTypes.number,
		unit: PropTypes.string.isRequired,
	};

	render() {
		const { path, queryDate, selectedDate, siteId, slug, unit, querystring } = this.props;
		const unitQueryDate = getUnitPeriod( queryDate, unit );
		const unitSelectedDate = getUnitPeriod( selectedDate, unit );
		const endSelectedDate = getEndPeriod( selectedDate, unit );
		const ordersQuery = {
			unit,
			date: unitQueryDate,
			quantity: UNITS[ unit ].quantity,
		};
		const topQuery = {
			unit,
			date: unitSelectedDate,
			limit: 10,
		};
		const topWidgets = [ topProducts, topCategories, topCoupons ];
		const widgetPath = `/${ unit }/${ slug }${ querystring ? '?' : '' }${ querystring || '' }`;

		return (
			<Main className="store-stats woocommerce" wideLayout={ true }>
				{ siteId && (
					<QuerySiteStats statType="statsOrders" siteId={ siteId } query={ ordersQuery } />
				) }
				<div className="store-stats__sidebar-nav">
					<SidebarNavigation />
				</div>
				<StatsNavigation
					selectedItem={ 'store' }
					siteId={ siteId }
					slug={ slug }
					interval={ unit }
				/>
				<Chart
					path={ path }
					query={ ordersQuery }
					selectedDate={ endSelectedDate }
					siteId={ siteId }
					unit={ unit }
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
								? moment( selectedDate, 'YYYY-MM-DD' )
										.subtract( 1, 'days' )
										.format( 'YYYY-MM-DD' )
								: selectedDate
						}
						query={ ordersQuery }
						statsType="statsOrders"
						showQueryDate
					/>
				</StatsPeriodNavigation>
				<div className="store-stats__widgets">
					{ sparkWidgets.map( ( widget, index ) => (
						<div className="store-stats__widgets-column spark-widgets" key={ index }>
							<Module
								siteId={ siteId }
								emptyMessage={ translate( 'No data found' ) }
								query={ ordersQuery }
								statType="statsOrders"
							>
								<WidgetList
									siteId={ siteId }
									query={ ordersQuery }
									selectedDate={ endSelectedDate }
									statType="statsOrders"
									widgets={ widget }
								/>
							</Module>
						</div>
					) ) }
					{ topWidgets.map( widget => {
						const header = (
							<SectionHeader href={ widget.basePath + widgetPath } label={ widget.title } />
						);
						return (
							<div className="store-stats__widgets-column" key={ widget.basePath }>
								{ siteId && (
									<QuerySiteStats
										statType={ widget.statType }
										siteId={ siteId }
										query={ topQuery }
									/>
								) }
								<Module
									siteId={ siteId }
									header={ header }
									emptyMessage={ widget.empty }
									query={ topQuery }
									statType={ widget.statType }
								>
									<List
										siteId={ siteId }
										values={ widget.values }
										query={ topQuery }
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

export default connect( state => ( {
	slug: getSelectedSiteSlug( state ),
	siteId: getSelectedSiteId( state ),
} ) )( StoreStats );
