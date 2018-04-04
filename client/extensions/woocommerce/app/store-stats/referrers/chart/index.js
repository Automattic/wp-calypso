/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StoreStatsChart from 'woocommerce/app/store-stats/store-stats-chart';
import Tabs from 'my-sites/stats/stats-tabs';
import Tab from 'my-sites/stats/stats-tabs/tab';
import { formatValue } from 'woocommerce/app/store-stats/utils';
import { referrerChartTabs as tabs } from 'woocommerce/app/store-stats/constants';
import { getStoreReferrersByReferrer } from 'state/selectors';

class Chart extends Component {
	static propTypes = {
		data: PropTypes.array.isRequired,
		selectedDate: PropTypes.string,
		selectedReferrer: PropTypes.string,
		chartFormat: PropTypes.string,
	};

	formatTabValue = ( tab, item ) => {
		return value => formatValue( value, tab.type, item.currency );
	};

	renderTabs = ( { chartData, selectedIndex, selectedTabIndex, tabClick } ) => {
		return (
			<Tabs data={ chartData }>
				{ tabs.map( ( tab, index ) => {
					const item = chartData[ selectedIndex ].data;
					return (
						<Tab
							key={ tab.attr }
							index={ index }
							label={ tab.label }
							selected={ index === selectedTabIndex }
							tabClick={ tabClick }
							gridicon={ tab.gridicon }
							value={ item[ tab.attr ] }
							format={ this.formatTabValue( tab, item ) }
						/>
					);
				} ) }
			</Tabs>
		);
	};

	render() {
		const { data, selectedDate, unit, slug, selectedReferrer } = this.props;
		return (
			<StoreStatsChart
				data={ data }
				selectedDate={ selectedDate }
				unit={ unit }
				renderTabs={ this.renderTabs }
				slug={ slug }
				basePath={ '/store/stats/referrers' }
				urlQueryParam={ { referrer: selectedReferrer } }
				tabs={ tabs }
			/>
		);
	}
}

export default connect( ( state, { siteId, query, selectedReferrer } ) => {
	return {
		data: getStoreReferrersByReferrer( state, {
			siteId,
			statType: 'statsStoreReferrers',
			query,
			selectedReferrer,
		} ),
	};
} )( Chart );
