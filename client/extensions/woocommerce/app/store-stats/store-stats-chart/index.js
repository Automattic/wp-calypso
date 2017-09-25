/**
 * External dependencies
 */
import classnames from 'classnames';
import { moment } from 'i18n-calypso';
import { findIndex } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getDelta } from '../utils';
import Card from 'components/card';
import ElementChart from 'components/chart';
import Legend from 'components/chart/legend';
import analytics from 'lib/analytics';
import formatCurrency from 'lib/format-currency';
import Tabs from 'my-sites/stats/stats-tabs';
import Tab from 'my-sites/stats/stats-tabs/tab';
import { getSiteStatsNormalizedData, isRequestingSiteStatsForQuery } from 'state/stats/lists/selectors';
import { getPeriodFormat } from 'state/stats/lists/utils';
import { UNITS } from 'woocommerce/app/store-stats/constants';
import { chartTabs as tabs } from 'woocommerce/app/store-stats/constants';
import Delta from 'woocommerce/components/delta';

class StoreStatsChart extends Component {
	static propTypes = {
		data: PropTypes.array.isRequired,
		deltas: PropTypes.array.isRequired,
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

		analytics.tracks.recordEvent( 'calypso_woocommerce_stats_chart_tab_click', {
			tab: tabs[ tab.index ].attr
		} );
	};

	buildChartData = ( item, selectedTab, chartFormat ) => {
		const { selectedDate } = this.props;
		const className = classnames( item.classNames.join( ' ' ), {
			'is-selected': item.period === selectedDate,
		} );
		return {
			label: item[ chartFormat ],
			value: item[ selectedTab.attr ],
			nestedValue: null,
			data: item,
			tooltipData: [],
			className,
		};
	};

	render() {
		const { data, deltas, selectedDate, unit } = this.props;
		const { selectedTabIndex } = this.state;
		const selectedTab = tabs[ selectedTabIndex ];
		const isLoading = ! data.length;
		const chartFormat = UNITS[ unit ].chartFormat;
		const chartData = data.map( item => this.buildChartData( item, selectedTab, chartFormat ) );
		const selectedIndex = findIndex( data, d => d.period === selectedDate );
		return (
			<Card className="store-stats-chart stats-module">
				<Legend
					activeTab={ selectedTab }
				/>
				<ElementChart loading={ isLoading } data={ chartData } barClick={ this.barClick } />
				<Tabs data={ chartData }>
					{ tabs.map( ( tab, tabIndex ) => {
						if ( ! isLoading ) {
							const itemChartData = this.buildChartData( data[ selectedIndex ], tabs[ tabIndex ] );
							const delta = getDelta( deltas, selectedDate, tab.attr );
							const deltaValue = ( delta.direction === 'is-undefined-increase' )
								? '-'
								: Math.abs( Math.round( delta.percentage_change * 100 ) );
							const periodFormat = getPeriodFormat( unit, delta.reference_period );
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
											? formatCurrency( itemChartData.value, data[ selectedIndex ].currency )
											:	Math.round( itemChartData.value * 100 ) / 100 }
									</span>
									<Delta
										value={ `${ deltaValue }%` }
										className={ `${ delta.favorable } ${ delta.direction }` }
										suffix={
											`since ${ moment( delta.reference_period, periodFormat ).format( UNITS[ unit ].sinceFormat ) }`
										}
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
	( state, { query, siteId } ) => {
		const statsData = getSiteStatsNormalizedData( state, siteId, 'statsOrders', query );
		return {
			data: statsData.data,
			deltas: statsData.deltas,
			isRequesting: isRequestingSiteStatsForQuery( state, siteId, 'statsOrders', query ),
		};
	}
)( StoreStatsChart );
