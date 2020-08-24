/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { flowRight } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import compareProps from 'lib/compare-props';
import Chart from 'components/chart';
import Legend from 'components/chart/legend';
import StatTabs from '../stats-tabs';
import StatsModulePlaceholder from '../stats-module/placeholder';
import { Card } from '@automattic/components';
import QuerySiteStats from 'components/data/query-site-stats';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getSiteStatsNormalizedData,
	isRequestingSiteStatsForQuery,
} from 'state/stats/lists/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';
import { getSiteOption } from 'state/sites/selectors';
import { formatDate, getQueryDate } from '../stats-chart-tabs/utility';

const ChartTabShape = PropTypes.shape( {
	attr: PropTypes.string,
	gridicon: PropTypes.string,
	label: PropTypes.string,
	legendOptions: PropTypes.arrayOf( PropTypes.string ),
} );

class WordAdsChartTabs extends Component {
	static propTypes = {
		activeTab: ChartTabShape,
		availableLegend: PropTypes.arrayOf( PropTypes.string ),
		charts: PropTypes.arrayOf( ChartTabShape ),
		data: PropTypes.arrayOf(
			PropTypes.shape( {
				classNames: PropTypes.arrayOf( PropTypes.string ),
				cpm: PropTypes.number,
				impressions: PropTypes.number,
				labelDay: PropTypes.string,
				period: PropTypes.string,
				revenue: PropTypes.number,
			} )
		),
		isActiveTabLoading: PropTypes.bool,
		onChangeLegend: PropTypes.func.isRequired,
	};

	buildTooltipData( item ) {
		const tooltipData = [];

		const dateLabel = formatDate( item.data.period, this.props.period.period );

		tooltipData.push( {
			label: dateLabel,
			className: 'is-date-label',
			value: null,
		} );

		switch ( this.props.chartTab ) {
			default:
				tooltipData.push( {
					label: this.props.translate( 'Ads Served' ),
					value: this.props.numberFormat( item.data.impressions ),
					className: 'is-impressions',
					icon: 'visible',
				} );
				tooltipData.push( {
					label: this.props.translate( 'Avg. CPM' ),
					value: '$ ' + this.props.numberFormat( item.data.cpm, { decimals: 2 } ),
					className: 'is-cpm',
					icon: 'stats-alt',
				} );
				tooltipData.push( {
					label: this.props.translate( 'Revenue' ),
					value: '$ ' + this.props.numberFormat( item.data.revenue, { decimals: 2 } ),
					className: 'is-revenue',
					icon: 'money',
				} );
				break;
		}

		return tooltipData;
	}

	buildChartData() {
		const { data } = this.props;
		if ( ! data ) {
			return [];
		}

		const labelKey =
			'label' +
			this.props.period.period.charAt( 0 ).toUpperCase() +
			this.props.period.period.slice( 1 );
		return data.map( ( record ) => {
			let recordClassName;
			if ( record.classNames && record.classNames.length ) {
				recordClassName = record.classNames.join( ' ' );
			}

			const className = classNames( recordClassName, {
				'is-selected': record.period === this.props.queryDate,
			} );

			const item = {
				label: record[ labelKey ],
				value: record[ this.props.chartTab ],
				data: record,
				className,
			};
			item.tooltipData = this.buildTooltipData( item );

			return item;
		} );
	}

	render() {
		const { siteId, query, isDataLoading } = this.props;
		const classes = [ 'stats-module', 'is-chart-tabs', { 'is-loading': isDataLoading } ];

		return (
			<div>
				{ siteId && <QuerySiteStats statType="statsAds" siteId={ siteId } query={ query } /> }

				<Card className={ classNames( ...classes ) }>
					<Legend
						activeCharts={ this.props.activeLegend }
						activeTab={ this.props.activeTab }
						tabs={ this.props.charts }
					/>
					{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
					<StatsModulePlaceholder className="is-chart" isLoading={ isDataLoading } />
					<Chart
						barClick={ this.props.barClick }
						data={ this.buildChartData() }
						loading={ isDataLoading }
					/>
					<StatTabs
						data={ this.props.data }
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

const NO_SITE_STATE = {
	siteId: null,
	data: [],
};

const connectComponent = connect(
	( state, { period: { period }, queryDate } ) => {
		const siteId = getSelectedSiteId( state );
		if ( ! siteId ) {
			return NO_SITE_STATE;
		}

		const quantity = 'year' === period ? 10 : 30;
		const timezoneOffset = getSiteOption( state, siteId, 'gmt_offset' ) || 0;
		const date = getQueryDate( queryDate, timezoneOffset, period, quantity );

		const query = { unit: period, date, quantity };
		const data = getSiteStatsNormalizedData( state, siteId, 'statsAds', query );
		const isDataLoading = isRequestingSiteStatsForQuery( state, siteId, 'statsAds', query );

		return {
			query,
			siteId,
			data,
			isDataLoading,
		};
	},
	{ recordGoogleEvent },
	null,
	{
		areStatePropsEqual: compareProps( {
			deep: [ 'activeTab', 'query' ],
		} ),
	}
);

export default flowRight( localize, connectComponent )( WordAdsChartTabs );
