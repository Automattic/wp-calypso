/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { find, flowRight } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import compareProps from 'lib/compare-props';
import ElementChart from 'components/chart';
import Legend from 'components/chart/legend';
import StatTabs from '../stats-tabs';
import StatsModulePlaceholder from '../stats-module/placeholder';
import Card from 'components/card';
import QuerySiteStats from 'components/data/query-site-stats';
import QuerySiteWordAdsStats from 'components/data/query-site-wordads-stats';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getWordAdsStats } from 'state/wordads/stats/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'state/stats/lists/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';
import { rangeOfPeriod } from 'state/stats/lists/utils';
import { getSiteOption } from 'state/sites/selectors';

class WordAdsChartTabs extends Component {
	constructor( props ) {
		super( props );
		const activeTab = this.getActiveTab();
		const activeCharts = activeTab.legendOptions ? activeTab.legendOptions.slice() : [];
		this.state = {
			activeLegendCharts: activeCharts,
			activeTab: activeTab,
		};
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		// @TODO update
		const activeTab = this.getActiveTab( nextProps );
		const activeCharts = activeTab.legendOptions ? activeTab.legendOptions.slice() : [];
		if ( activeTab !== this.state.activeTab ) {
			this.setState( {
				activeLegendCharts: activeCharts,
				activeTab: activeTab,
			} );
		}
	}

	buildTooltipData( item ) {
		const tooltipData = [];
		const date = this.props.moment( item.data.period );
		let dateLabel;
		switch ( this.props.period.period ) {
			case 'day':
				dateLabel = date.format( 'LL' );
				break;
			case 'week':
				dateLabel = date.format( 'L' ) + ' - ' + date.add( 6, 'days' ).format( 'L' );
				break;
			case 'month':
				dateLabel = date.format( 'MMMM YYYY' );
				break;
			case 'year':
				dateLabel = date.format( 'YYYY' );
				break;
		}

		tooltipData.push( {
			label: dateLabel,
			className: 'is-date-label',
			value: null,
		} );

		// @TODO update these tooltips
		switch ( this.props.chartTab ) {
			case 'impressions':
				tooltipData.push( {
					label: this.props.translate( 'Ads Served' ),
					value: this.props.numberFormat( item.value ),
					className: 'is-impressions',
					icon: 'visible',
				} );
				break;
			case 'revenue':
				tooltipData.push( {
					label: this.props.translate( 'Revenue' ),
					value: '$ ' + this.props.numberFormat( item.value, { decimals: 2 } ),
					className: 'is-revenue',
					icon: 'visible',
				} );
				break;
			case 'cpm':
				tooltipData.push( {
					label: this.props.translate( 'Avg. CPM' ),
					value: '$ ' + this.props.numberFormat( item.value, { decimals: 2 } ),
					className: 'is-cpm',
					icon: 'visible',
				} );
				break;
			default:
				tooltipData.push( {
					label: this.props.translate( 'Impressions' ),
					value: this.props.numberFormat( item.data.impressions ),
					className: 'is-impressions',
					icon: 'visible',
				} );
				tooltipData.push( {
					label: this.props.translate( 'Revenue' ),
					value: this.props.numberFormat( item.data.revenue, { decimals: 2 } ),
					className: 'is-revenue',
					icon: 'visible',
				} );
				tooltipData.push( {
					label: this.props.translate( 'CPM' ),
					value: this.props.numberFormat( item.data.impressions / item.data.revenue ),
					className: 'is-cpm',
					icon: 'visible',
				} );
				break;
		}

		return tooltipData;
	}

	onLegendClick = chartItem => {
		const activeLegendCharts = this.state.activeLegendCharts;
		const chartIndex = activeLegendCharts.indexOf( chartItem );
		let gaEventAction;
		if ( -1 === chartIndex ) {
			activeLegendCharts.push( chartItem );
			gaEventAction = ' on';
		} else {
			activeLegendCharts.splice( chartIndex );
			gaEventAction = ' off';
		}
		this.props.recordGoogleEvent(
			'WordAds Stats',
			`Toggled Nested Chart ${ chartItem } ${ gaEventAction }`
		);
		this.setState( {
			activeLegendCharts,
		} );
	};

	getActiveTab( nextProps ) {
		const props = nextProps || this.props;
		return find( props.charts, { attr: props.chartTab } ) || props.charts[ 0 ];
	}

	getLoadedData() {
		const { fullQueryData, fullQueryRequesting } = this.props;
		return fullQueryData;
	}

	buildChartData() {
		const data = this.getLoadedData();
		if ( ! data ) {
			return [];
		}

		const activeTab = this.props.chartTab;
		const labelKey =
			'label' +
			this.props.period.period.charAt( 0 ).toUpperCase() +
			this.props.period.period.slice( 1 );
		return data.map( record => {
			let recordClassName;
			if ( record.classNames && record.classNames.length ) {
				recordClassName = record.classNames.join( ' ' );
			}

			const className = classNames( recordClassName, {
				'is-selected': record.period === this.props.queryDate,
			} );

			const item = {
				label: record[ labelKey ],
				value: record[ activeTab ],
				data: record,
				className,
			};
			item.tooltipData = this.buildTooltipData( item );

			return item;
		} );
	}

	render() {
		const { query, fullQuery, fullQueryRequesting, siteId } = this.props;
		const chartData = this.buildChartData();
		const activeTab = this.getActiveTab();
		const data = this.getLoadedData();

		const activeTabLoading = fullQueryRequesting && ! ( data && data.length );
		const classes = [
			'stats-module',
			'is-chart-tabs',
			{
				'is-loading': activeTabLoading,
			},
		];

		return (
			<div>
				{ /* siteId && (
					<QuerySiteWordAdsStats statType="statsAds" siteId={ siteId } query={ query } />
				) */ }
				{ siteId && <QuerySiteStats statType="statsAds" siteId={ siteId } query={ query } /> }

				<Card className={ classNames( ...classes ) }>
					<Legend
						tabs={ this.props.charts }
						activeTab={ activeTab }
						activeCharts={ this.state.activeLegendCharts }
						clickHandler={ this.onLegendClick }
					/>
					<StatsModulePlaceholder className="is-chart" isLoading={ activeTabLoading } />
					<ElementChart
						loading={ activeTabLoading }
						data={ chartData }
						barClick={ this.props.barClick }
					/>
					<StatTabs
						data={ data }
						tabs={ this.props.charts }
						switchTab={ this.props.switchTab }
						selectedTab={ this.props.chartTab }
						activeIndex={ this.props.queryDate }
						activeKey="period"
					/>
				</Card>
			</div>
		);
	}
}

const connectComponent = connect(
	( state, { moment, period: periodObject, chartTab, queryDate } ) => {
		const siteId = getSelectedSiteId( state );
		const { period } = periodObject;
		const timezoneOffset = getSiteOption( state, siteId, 'gmt_offset' ) || 0;
		const momentSiteZone = moment().utcOffset( timezoneOffset );
		let date = rangeOfPeriod( period, momentSiteZone.locale( 'en' ) ).endOf;

		let quantity = 30;
		switch ( period ) {
			case 'year':
				quantity = 10;
				break;
		}
		const periodDifference = moment( date ).diff( moment( queryDate ), period );
		if ( periodDifference >= quantity ) {
			date = moment( date )
				.subtract( Math.floor( periodDifference / quantity ) * quantity, period )
				.format( 'YYYY-MM-DD' );
		}

		const query = {
			unit: period,
			date,
			quantity,
		};
		const fullQuery = {
			...query,
			stat_fields: 'impressions, revenue, cpm',
		};

		const statsData = getSiteStatsNormalizedData( state, siteId, 'statsAds', query );

		return {
			query: query,
			fullQueryRequesting: isRequestingSiteStatsForQuery( state, siteId, 'statsAds', query ),
			fullQueryData: getSiteStatsNormalizedData( state, siteId, 'statsAds', query ), // getWordAdsStats( state, siteId ),
			siteId,
		};
	},
	{ recordGoogleEvent }
);

export default flowRight(
	localize,
	connectComponent
)( WordAdsChartTabs );
