/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import StoreStatsChart from 'woocommerce/app/store-stats/store-stats-chart';
import Delta from 'woocommerce/components/delta';
import { getPeriodFormat } from 'state/stats/lists/utils';
import { getDelta } from '../utils';
import {
	getSiteStatsNormalizedData,
	isRequestingSiteStatsForQuery,
} from 'state/stats/lists/selectors';
import Tabs from 'my-sites/stats/stats-tabs';
import Tab from 'my-sites/stats/stats-tabs/tab';
import { UNITS, chartTabs as tabs } from 'woocommerce/app/store-stats/constants';
import { formatValue } from 'woocommerce/app/store-stats/utils';

class StoreStatsOrdersChart extends Component {
	static propTypes = {
		data: PropTypes.array.isRequired,
		deltas: PropTypes.array.isRequired,
		isRequesting: PropTypes.bool.isRequired,
		query: PropTypes.object.isRequired,
		selectedDate: PropTypes.string.isRequired,
		siteId: PropTypes.number,
		unit: PropTypes.string.isRequired,
		slug: PropTypes.string,
	};

	renderTabs = ( { chartData, selectedIndex, selectedTabIndex, selectedDate, unit, tabClick } ) => {
		const { deltas } = this.props;
		return (
			<Tabs data={ chartData }>
				{ tabs.map( ( tab, tabIndex ) => {
					if ( tab.isHidden ) {
						return null;
					}
					const itemChartData = chartData[ selectedIndex ];
					const delta = getDelta( deltas, selectedDate, tab.attr );
					const deltaValue =
						delta.direction === 'is-undefined-increase'
							? '-'
							: Math.abs( Math.round( delta.percentage_change * 100 ) );
					const periodFormat = getPeriodFormat( unit, delta.reference_period );
					const value = itemChartData.data[ tab.attr ];
					return (
						<Tab
							key={ tab.attr }
							index={ tabIndex }
							label={ tab.tabLabel || tab.label }
							selected={ tabIndex === selectedTabIndex }
							tabClick={ tabClick }
						>
							<span className="store-stats-orders-chart__value value">
								{ formatValue( value, tab.type, itemChartData.data.currency ) }
							</span>
							<Delta
								value={ `${ deltaValue }%` }
								className={ `${ delta.favorable } ${ delta.direction }` }
								suffix={ `since ${ moment( delta.reference_period, periodFormat ).format(
									UNITS[ unit ].shortFormat
								) }` }
							/>
						</Tab>
					);
				} ) }
			</Tabs>
		);
	};

	render() {
		const { data, selectedDate, unit, slug } = this.props;
		return (
			<StoreStatsChart
				className="store-stats-orders-chart"
				data={ data }
				selectedDate={ selectedDate }
				unit={ unit }
				renderTabs={ this.renderTabs }
				slug={ slug }
				basePath={ '/store/stats/orders' }
				tabs={ tabs }
			/>
		);
	}
}

export default connect( ( state, { query, siteId } ) => {
	const statsData = getSiteStatsNormalizedData( state, siteId, 'statsOrders', query );
	return {
		data: statsData.data,
		deltas: statsData.deltas,
		isRequesting: isRequestingSiteStatsForQuery( state, siteId, 'statsOrders', query ),
	};
} )( StoreStatsOrdersChart );
