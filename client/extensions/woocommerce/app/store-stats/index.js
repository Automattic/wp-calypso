/**
 * External dependencies
 */
import { moment, translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Chart from './store-stats-chart';
import List from './store-stats-list';
import Module from './store-stats-module';
import Navigation from './store-stats-navigation';
import WidgetList from './store-stats-widget-list';
import { getUnitPeriod, getEndPeriod } from './utils';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import QuerySiteStats from 'components/data/query-site-stats';
import JetpackColophon from 'components/jetpack-colophon';
import Main from 'components/main';
import SectionHeader from 'components/section-header';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import DatePicker from 'my-sites/stats/stats-date-picker';
import StatsPeriodNavigation from 'my-sites/stats/stats-period-navigation';
import { getJetpackSites } from 'state/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { sparkWidgets, topProducts, topCategories, topCoupons, UNITS } from 'woocommerce/app/store-stats/constants';

class StoreStats extends Component {
	static propTypes = {
		jetPackSites: PropTypes.array,
		path: PropTypes.string.isRequired,
		queryDate: PropTypes.string,
		querystring: PropTypes.string,
		selectedDate: PropTypes.string,
		siteId: PropTypes.number,
		unit: PropTypes.string.isRequired,
	};

	render() {
		const { jetPackSites, path, queryDate, selectedDate, siteId, slug, unit, querystring } = this.props;
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
				<QueryJetpackPlugins siteIds={ jetPackSites.map( site => site.ID ) } />
				{ siteId && <QuerySiteStats statType="statsOrders" siteId={ siteId } query={ ordersQuery } /> }
				<div className="store-stats__sidebar-nav"><SidebarNavigation /></div>
				<Navigation unit={ unit } type="orders" slug={ slug } />
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
							( unit === 'week' )
								? moment( selectedDate, 'YYYY-MM-DD' ).subtract( 1, 'days' ).format( 'YYYY-MM-DD' )
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
								{ siteId && <QuerySiteStats
									statType={ widget.statType }
									siteId={ siteId }
									query={ topQuery }
								/> }
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

export default connect(
	state => ( {
		slug: getSelectedSiteSlug( state ),
		siteId: getSelectedSiteId( state ),
		jetPackSites: getJetpackSites( state ),
	} )
)( StoreStats );
