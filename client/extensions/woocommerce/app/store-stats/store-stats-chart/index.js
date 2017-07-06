/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import page from 'page';
import { findIndex, find } from 'lodash';
import { moment } from 'i18n-calypso';

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
import Delta from 'woocommerce/components/delta';
import formatCurrency from 'lib/format-currency';

class StoreStatsChart extends Component {
	static propTypes = {
		data: PropTypes.object.isRequired,
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

	getDeltasBySelectedPeriod = () => {
		return find( this.props.data.deltas, ( item ) => item.period === this.props.selectedDate );
	};

	getDeltaByStat = ( stat ) => {
		return this.getDeltasBySelectedPeriod()[ stat ];
	};

	getSelectedIndex = ( data ) => {
		return findIndex( data, d => d.period === this.props.selectedDate );
	};

	render() {
		const { siteId, query, data } = this.props;
		const { selectedTabIndex } = this.state;
		const orderData = data.data;
		const tabs = [
			{ label: 'Gross Sales', attr: 'gross_sales', type: 'currency' },
			{ label: 'Net Sales', attr: 'net_sales', type: 'currency' },
			{ label: 'Orders', attr: 'orders', type: 'number' },
			{ label: 'Average Order Value', attr: 'avg_order_value', type: 'currency' },
		];
		const selectedTab = tabs[ selectedTabIndex ];
		const isLoading = ! orderData.length;
		const chartData = orderData.map( item => this.buildChartData( item, selectedTab ) );
		const selectedIndex = this.getSelectedIndex( orderData );
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
							const itemChartData = this.buildChartData( orderData[ selectedIndex ], tabs[ tabIndex ] );
							const delta = this.getDeltaByStat( tab.attr );
							const deltaValue = Math.abs( Math.round( delta.percentage_change * 100 ) );
							return (
								<Tab
									key={ tab.attr }
									index={ tabIndex }
									label={ tab.label }
									selected={ tabIndex === selectedTabIndex }
									tabClick={ this.tabClick }
								>
									<span className="store-stats-chart__value value">
										{ ( tab.type === 'currency' )
											? formatCurrency( itemChartData.value )
											:	Math.round( itemChartData.value * 100 ) / 100 }
									</span>
									<Delta
										value={ `${ deltaValue }%` }
										className={ `${ delta.favorable } ${ delta.direction }` }
										suffix={ `since ${ moment( delta.reference_period ).format( 'MMM D' ) }` }
									/>
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
	( state, { query, siteId } ) => ( {
		data: getSiteStatsNormalizedData( state, siteId, 'statsOrders', query ),
		isRequesting: isRequestingSiteStatsForQuery( state, siteId, 'statsOrders', query ),
	} )
)( StoreStatsChart );
