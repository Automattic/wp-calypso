import { Icon, chartBar, trendingUp } from '@wordpress/icons';
import classNames from 'classnames';
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
					value: this.props.numberFormat( item.data.impressions ),
					className: 'is-impressions',
					//TODO: replace with an icon when available.
					icon: (
						<svg
							className="gridicon"
							width="24"
							height="24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="m4 13 .67.336.003-.005a2.42 2.42 0 0 1 .094-.17c.071-.122.18-.302.329-.52.298-.435.749-1.017 1.359-1.598C7.673 9.883 9.498 8.75 12 8.75s4.326 1.132 5.545 2.293c.61.581 1.061 1.163 1.36 1.599a8.29 8.29 0 0 1 .422.689l.002.005L20 13l.67-.336v-.003l-.003-.005-.008-.015-.028-.052a9.752 9.752 0 0 0-.489-.794 11.6 11.6 0 0 0-1.562-1.838C17.174 8.617 14.998 7.25 12 7.25S6.827 8.618 5.42 9.957c-.702.669-1.22 1.337-1.563 1.839a9.77 9.77 0 0 0-.516.845l-.008.015-.002.005-.001.002v.001L4 13Zm8 3a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
								fill="#fff"
							/>
						</svg>
					),
				} );
				tooltipData.push( {
					label: this.props.translate( 'Avg. CPM' ),
					value: '$ ' + this.props.numberFormat( item.data.cpm, { decimals: 2 } ),
					className: 'is-cpm',
					icon: <Icon className="gridicon" icon={ chartBar } />,
				} );
				tooltipData.push( {
					label: this.props.translate( 'Revenue' ),
					value: '$ ' + this.props.numberFormat( item.data.revenue, { decimals: 2 } ),
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
		const { siteId, query, isDataLoading, activeTab } = this.props;
		const classes = [
			'is-chart-tabs',
			{
				'is-loading': isDataLoading,
			},
		];

		return (
			<>
				{ siteId && <QuerySiteStats statType="statsAds" siteId={ siteId } query={ query } /> }

				<div className={ classNames( ...classes ) }>
					{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
					<StatsModulePlaceholder className="is-chart" isLoading={ isDataLoading } />
					<Chart barClick={ this.props.barClick } data={ this.buildChartData() } minBarWidth={ 35 }>
						<StatsEmptyState stateType={ activeTab && activeTab.label } />
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
