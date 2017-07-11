/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import page from 'page';
import { moment, translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Navigation from './store-stats-navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import Chart from './store-stats-chart';
import StatsPeriodNavigation from 'my-sites/stats/stats-period-navigation';
import DatePicker from 'my-sites/stats/stats-date-picker';
import Module from './store-stats-module';
import List from './store-stats-list';
import WidgetList from './store-stats-widget-list';
import SectionHeader from 'components/section-header';
import {
	sparkWidgetList1,
	sparkWidgetList2,
	topProducts,
	topCategories,
	topCoupons,
	UNITS
} from 'woocommerce/app/store-stats/constants';
import { getUnitPeriod, getEndPeriod } from './utils';
import { isJetpackSite } from 'state/sites/selectors';
import { isPluginActive } from 'state/selectors';

class StoreStats extends Component {
	static propTypes = {
		isWooConnect: PropTypes.bool,
		path: PropTypes.string.isRequired,
		queryDate: PropTypes.string,
		querystring: PropTypes.string,
		selectedDate: PropTypes.string,
		siteId: PropTypes.number,
		unit: PropTypes.string.isRequired,
	};

	render() {
		const { isWooConnect, path, queryDate, selectedDate, siteId, slug, unit, querystring } = this.props;
		// TODO: this is to handle users switching sites while on store stats
		// unfortunately, we can't access the path when changing sites
		if ( ! isWooConnect ) {
			page.redirect( `/stats/${ slug }` );
		}
		const unitQueryDate = getUnitPeriod( queryDate, unit );
		const unitSelectedDate = getUnitPeriod( selectedDate, unit );
		const endSelectedDate = getEndPeriod( selectedDate, unit );
		const ordersQuery = {
			unit,
			date: queryDate,
			quantity: UNITS[ unit ].quantity,
		};
		const topQuery = {
			unit,
			date: unitSelectedDate,
			limit: 10,
		};
		const topWidgets = [ topProducts, topCategories, topCoupons ];
		const widgetPath = `/${ unit }/${ slug }${ querystring ? '?' : '' }${ querystring || '' }`;

		const widgetList1 = (
			<div className="store-stats__widgets-column spark-widgets" key="sparkwidgets1">
				<WidgetList
					siteId={ siteId }
					header={ null }
					emptyMessage={ translate( 'No data found.' ) }
					query={ Object.assign( {}, ordersQuery, { date: unitQueryDate } ) }
					selectedDate={ endSelectedDate }
					statType="statsOrders"
					widgets={ sparkWidgetList1 }
				/>
			</div>
			);
		const widgetList2 = (
			<div className="store-stats__widgets-column spark-widgets" key="sparkwidgets2">
				<WidgetList
					siteId={ siteId }
					header={ null }
					emptyMessage={ translate( 'No data found.' ) }
					query={ Object.assign( {}, ordersQuery, { date: unitQueryDate } ) }
					selectedDate={ endSelectedDate }
					statType="statsOrders"
					widgets={ sparkWidgetList2 }
				/>
			</div>
		);

		return (
			<Main className="store-stats woocommerce" wideLayout={ true }>
				<div className="store-stats__sidebar-nav"><SidebarNavigation /></div>
				<Navigation unit={ unit } type="orders" slug={ slug } />
				<Chart
					path={ path }
					query={ Object.assign( {}, ordersQuery, { date: unitQueryDate } ) }
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
					{ widgetList1 }
					{ widgetList2 }
					{ topWidgets.map( widget => {
						const header = (
							<SectionHeader href={ widget.basePath + widgetPath }>
								{ widget.title }
							</SectionHeader>
						);
						return (
							<div className="store-stats__widgets-column" key={ widget.basePath }>
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
			</Main>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const isJetpack = isJetpackSite( state, siteId );
		return {
			isWooConnect: isJetpack && isPluginActive( state, siteId, 'woocommerce' ),
			slug: getSelectedSiteSlug( state ),
			siteId,
		};
	}
)( StoreStats );
