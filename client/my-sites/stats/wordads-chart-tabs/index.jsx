import { eye } from '@automattic/components/src/icons';
import { formatNumber } from '@automattic/number-formatters';
import { Icon, chartBar, trendingUp } from '@wordpress/icons';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Chart from 'calypso/components/chart';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import compareProps from 'calypso/lib/compare-props';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSiteOption } from 'calypso/state/sites/selectors';
import {
	getSiteStatsNormalizedData,
	isRequestingSiteStatsForQuery,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { formatDate, getQueryDate } from '../stats-chart-tabs/utility';
import StatsEmptyState from '../stats-empty-state';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatTabs from '../stats-tabs';

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
					value: formatNumber( item.data.impressions ),
					className: 'is-impressions',
					icon: <Icon className="gridicon" icon={ eye } />,
				} );
				tooltipData.push( {
					label: this.props.translate( 'Avg. CPM' ),
					value: '$ ' + formatNumber( item.data.cpm, { decimals: 2 } ),
					className: 'is-cpm',
					icon: <Icon className="gridicon" icon={ chartBar } />,
				} );
				tooltipData.push( {
					label: this.props.translate( 'Revenue' ),
					value: '$ ' + formatNumber( item.data.revenue, { decimals: 2 } ),
					className: 'is-revenue',
					icon: <Icon className="gridicon" icon={ trendingUp } />,
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

			const className = clsx( recordClassName, {
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
		const classes = [
			'is-chart-tabs',
			{
				'is-loading': isDataLoading,
			},
		];

		return (
			<>
				{ siteId && <QuerySiteStats statType="statsAds" siteId={ siteId } query={ query } /> }

				<div className={ clsx( ...classes ) }>
					{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
					<StatsModulePlaceholder className="is-chart" isLoading={ isDataLoading } />
					<Chart barClick={ this.props.barClick } data={ this.buildChartData() } minBarWidth={ 35 }>
						<StatsEmptyState />
					</Chart>
					<StatTabs
						data={ this.props.data }
						tabs={ this.props.charts }
						switchTab={ this.props.switchTab }
						selectedTab={ this.props.chartTab }
						activeIndex={ this.props.queryDate }
						activeKey="period"
						iconSize={ 24 }
					/>
				</div>
			</>
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
