/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import page from 'page';
import { findIndex } from 'lodash';
import { moment, translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Delta from 'woocommerce/components/delta';
import ElementChart from 'components/chart';
import formatCurrency from 'lib/format-currency';
import { getPeriodFormat } from 'state/stats/lists/utils';
import { getDelta } from '../utils';
import {
	getSiteStatsNormalizedData,
	isRequestingSiteStatsForQuery,
} from 'state/stats/lists/selectors';
import Legend from 'components/chart/legend';
import Tabs from 'my-sites/stats/stats-tabs';
import Tab from 'my-sites/stats/stats-tabs/tab';
import { UNITS } from 'woocommerce/app/store-stats/constants';
import analytics from 'lib/analytics';
import { chartTabs as tabs } from 'woocommerce/app/store-stats/constants';

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
		selectedTabIndex: 0,
	};

	barClick = bar => {
		page.redirect( `${ this.props.path }?startDate=${ bar.data.period }` );
	};

	tabClick = tab => {
		this.setState( {
			selectedTabIndex: tab.index,
		} );

		analytics.tracks.recordEvent( 'calypso_woocommerce_stats_chart_tab_click', {
			tab: tabs[ tab.index ].attr,
		} );
	};

	createTooltipDate = item => {
		const { unit } = this.props;
		const dateFormat = UNITS[ unit ].shortFormat;
		const date = moment( item.period );
		if ( unit === 'week' ) {
			return `${ date.subtract( 6, 'days' ).format( dateFormat ) } - ${ moment(
				item.period
			).format( dateFormat ) }`;
		}
		return date.format( dateFormat );
	};

	buildToolTipData = ( item, selectedTab ) => {
		const value =
			selectedTab.type === 'currency'
				? formatCurrency( item[ selectedTab.attr ], item.currency )
				: Math.round( item[ selectedTab.attr ] * 100 ) / 100;
		const data = [
			{ className: 'is-date-label', value: null, label: this.createTooltipDate( item ) },
			{
				value,
				label: selectedTab.label,
			},
		];
		if ( selectedTab.attr === 'gross_sales' ) {
			data.push( {
				value: formatCurrency( item.net_sales, item.currency ),
				label: translate( 'Net Sales' ),
			} );
		}
		return data;
	};

	buildChartData = ( item, selectedTab, chartFormat ) => {
		const { selectedDate } = this.props;
		const className = classnames( item.classNames.join( ' ' ), {
			'is-selected': item.period === selectedDate,
		} );
		return {
			label: item[ chartFormat ],
			value: item[ selectedTab.attr ],
			nestedValue: selectedTab.attr === 'gross_sales' ? item.net_sales : null,
			data: item,
			tooltipData: this.buildToolTipData( item, selectedTab ),
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
				{ selectedTab.attr === 'gross_sales' ? (
					<Legend
						activeTab={ selectedTab }
						availableCharts={ [ 'net_sales' ] }
						tabs={ [ { label: translate( 'Net Sales' ), attr: 'net_sales' } ] }
					/>
				) : (
					<Legend activeTab={ selectedTab } />
				) }
				<ElementChart loading={ isLoading } data={ chartData } barClick={ this.barClick } />
				<Tabs data={ chartData }>
					{ tabs.map( ( tab, tabIndex ) => {
						if ( ! isLoading ) {
							const itemChartData = this.buildChartData( data[ selectedIndex ], tabs[ tabIndex ] );
							const delta = getDelta( deltas, selectedDate, tab.attr );
							const deltaValue =
								delta.direction === 'is-undefined-increase'
									? '-'
									: Math.abs( Math.round( delta.percentage_change * 100 ) );
							const periodFormat = getPeriodFormat( unit, delta.reference_period );
							return (
								<Tab
									key={ tab.attr }
									index={ tabIndex }
									label={ tab.tabLabel || tab.label }
									selected={ tabIndex === selectedTabIndex }
									tabClick={ this.tabClick }
								>
									<span className="store-stats-chart__value value">
										{ tab.type === 'currency'
											? formatCurrency( itemChartData.value, data[ selectedIndex ].currency )
											: Math.round( itemChartData.value * 100 ) / 100 }
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
						}
					} ) }
				</Tabs>
			</Card>
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
} )( StoreStatsChart );
