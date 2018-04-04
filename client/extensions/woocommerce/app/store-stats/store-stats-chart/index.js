/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import page from 'page';
import { findIndex, find } from 'lodash';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ElementChart from 'components/chart';
import Legend from 'components/chart/legend';
import { recordTrack } from 'woocommerce/lib/analytics';
import { getWidgetPath, formatValue } from 'woocommerce/app/store-stats/utils';
import { UNITS } from 'woocommerce/app/store-stats/constants';

class StoreStatsChart extends Component {
	static propTypes = {
		data: PropTypes.array.isRequired,
		selectedDate: PropTypes.string.isRequired,
		unit: PropTypes.string.isRequired,
		basePath: PropTypes.string.isRequired,
		slug: PropTypes.string,
		renderTabs: PropTypes.func.isRequired,
		tabs: PropTypes.array.isRequired,
		urlQueryParam: PropTypes.object,
	};

	static defaultProps = {
		urlQueryParam: {},
	};

	constructor( props ) {
		super( props );
		this.state = {
			selectedTabIndex: 0,
			activeCharts: props.tabs[ 0 ].availableCharts,
		};
	}

	barClick = bar => {
		const { unit, slug, basePath, urlQueryParam } = this.props;
		const query = Object.assign( { startDate: bar.data.period }, urlQueryParam );
		const path = getWidgetPath( unit, slug, query );
		page( `${ basePath }${ path }` );
	};

	tabClick = tab => {
		const { tabs } = this.props;
		const tabData = tabs[ tab.index ];
		this.setState( {
			selectedTabIndex: tab.index,
			activeCharts: tabData.availableCharts,
		} );

		recordTrack( 'calypso_woocommerce_stats_chart_tab_click', {
			tab: tabData.attr,
		} );
	};

	legendClick = attr => {
		const activeCharts = this.state.activeCharts.indexOf( attr ) === -1 ? [ attr ] : [];
		this.setState( {
			activeCharts,
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
		const { tabs } = this.props;
		const { activeCharts } = this.state;
		const value = formatValue( item[ selectedTab.attr ] || 0, selectedTab.type, item.currency );
		const data = [
			{ className: 'is-date-label', value: null, label: this.createTooltipDate( item ) },
			{
				value,
				label: selectedTab.label,
			},
		];
		activeCharts.forEach( attr => {
			data.push( {
				value: formatValue( item[ attr ], selectedTab.type, item.currency ),
				label: find( tabs, tab => tab.attr === attr ).label,
			} );
		} );
		return data;
	};

	buildChartData = ( item, selectedTab, chartFormat ) => {
		const { selectedDate } = this.props;
		const { activeCharts } = this.state;
		const className = classnames( item.classNames.join( ' ' ), {
			'is-selected': item.period === selectedDate,
		} );
		const nestedValue = item[ activeCharts[ 0 ] ];
		return {
			label: item[ chartFormat ],
			value: item[ selectedTab.attr ] || 0,
			nestedValue,
			data: item,
			tooltipData: this.buildToolTipData( item, selectedTab ),
			className,
		};
	};

	renderLegend = selectedTabIndex => {
		const { tabs } = this.props;
		const activeTab = tabs[ selectedTabIndex ];
		return (
			<Legend
				activeTab={ activeTab }
				availableCharts={ activeTab.availableCharts }
				activeCharts={ this.state.activeCharts }
				tabs={ tabs }
				clickHandler={ this.legendClick }
			/>
		);
	};

	render() {
		const { data, selectedDate, unit, renderTabs, tabs, className } = this.props;
		const { selectedTabIndex } = this.state;
		const selectedTab = tabs[ selectedTabIndex ];
		const isLoading = ! data.length;
		const chartFormat = UNITS[ unit ].chartFormat;
		const chartData = data.map( item => this.buildChartData( item, selectedTab, chartFormat ) );
		const selectedIndex = findIndex( data, d => d.period === selectedDate );
		return (
			<Card className={ classnames( className, 'stats-module' ) }>
				{ this.renderLegend( selectedTabIndex ) }
				<ElementChart loading={ isLoading } data={ chartData } barClick={ this.barClick } />
				{ ! isLoading &&
					renderTabs( {
						chartData,
						selectedIndex,
						selectedTabIndex,
						selectedDate,
						unit,
						tabClick: this.tabClick,
					} ) }
			</Card>
		);
	}
}
export default StoreStatsChart;
