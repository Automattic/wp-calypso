/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import page from 'page';
import { findIndex } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import QuerySiteStats from 'components/data/query-site-stats';
import { getSiteStatsNormalizedData, isRequestingSiteStatsForQuery } from 'state/stats/lists/selectors';
import ElementChart from 'components/chart';
import Legend from 'components/chart/legend';
import Tabs from 'my-sites/stats/stats-tabs';
import Tab from 'my-sites/stats/stats-tabs/tab';
import { calculateDelta } from 'woocommerce/app/store-stats/utils';

class StoreStatsChart extends Component {
	static propTypes = {
		data: PropTypes.array.isRequired,
		isRequesting: PropTypes.bool.isRequired,
		path: PropTypes.string.isRequired,
		query: PropTypes.object.isRequired,
		selectedDate: PropTypes.string.isRequired,
		siteId: PropTypes.number,
		unit: PropTypes.string.isRequired,
	};

	state = {
		selectedTabIndex: 0
	};

	barClick = bar => {
		page.redirect( `${ this.props.path }?startDate=${ bar.data.period }` );
	};

	tabClick = tab => {
		this.setState( {
			selectedTabIndex: tab.index,
		} );
	};

	buildChartData = ( item, selectedTab ) => {
		const { selectedDate } = this.props;
		const className = classnames( item.classNames.join( ' ' ), {
			'is-selected': item.period === selectedDate,
		} );
		return {
			label: item.labelDay,
			value: item[ selectedTab.attr ],
			nestedValue: null,
			data: item,
			tooltipData: [],
			className,
		};
	};

	getSelectedIndex = data => {
		return findIndex( data, d => d.period === this.props.selectedDate );
	};

	render() {
		const { siteId, query, data, unit } = this.props;
		const { selectedTabIndex } = this.state;
		const tabs = [
			{ label: 'Gross Sales', attr: 'gross_sales' },
			{ label: 'Net Sales', attr: 'net_sales' },
			{ label: 'Orders', attr: 'orders' },
			{ label: 'Average Order Value', attr: 'avg_order_value' },
		];
		const selectedTab = tabs[ selectedTabIndex ];
		const isLoading = ! data.length;
		const chartData = data.map( item => this.buildChartData( item, selectedTab ) );
		const selectedIndex = this.getSelectedIndex( data );
		return (
			<Card className="store-stats-chart stats-module">
				{ siteId && <QuerySiteStats
					query={ query }
					siteId={ siteId }
					statType="statsOrders"
				/> }
				<Legend
					activeTab={ selectedTab }
				/>
				<ElementChart loading={ isLoading } data={ chartData } barClick={ this.barClick } />
				<Tabs data={ chartData }>
					{ tabs.map( ( tab, tabIndex ) => {
						if ( ! isLoading ) {
							const itemChartData = this.buildChartData( data[ selectedIndex ], tabs[ tabIndex ] );
							const delta = calculateDelta( data[ selectedIndex ], data[ selectedIndex - 1 ], tabs[ tabIndex ].attr, unit );
							return (
								<Tab
									key={ tab.attr }
									index={ tabIndex }
									selected={ tabIndex === selectedTabIndex }
									tabClick={ this.tabClick }
								>
									<div>{ tab.label }</div>
									<div>{ itemChartData.value }</div>
									<div>{ delta.value }</div>
									<div>{ delta.since }</div>
								</Tab>
							);
						}
					} ) }
				</Tabs>
			</Card>
		);
	}
}

export default connect(
	( state, { query, siteId } ) => {
		return {
			data: getSiteStatsNormalizedData( state, siteId, 'statsOrders', query ),
			isRequesting: isRequestingSiteStatsForQuery( state, siteId, 'statsOrders', query ),
		};
	}
)( StoreStatsChart );
