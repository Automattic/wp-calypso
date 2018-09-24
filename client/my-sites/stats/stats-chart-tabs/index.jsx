/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { find, flowRight } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import compareProps from 'lib/compare-props';
import Card from 'components/card';
import Chart from 'components/chart';
import Legend from 'components/chart/legend';
import QuerySiteStats from 'components/data/query-site-stats';
import { recordGoogleEvent } from 'state/analytics/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteOption } from 'state/sites/selectors';
import StatTabs from '../stats-tabs';
import StatsModulePlaceholder from '../stats-module/placeholder';
import {
	formatDate,
	generateQueries,
	getMergedData,
	getQueryDate,
	getRequestStatuses,
} from './utility';

class StatModuleChartTabs extends Component {
	static propTypes = {
		data: PropTypes.arrayOf(
			PropTypes.shape( {
				comments: PropTypes.number,
				labelDay: PropTypes.string,
				likes: PropTypes.number,
				period: PropTypes.string,
				posts: PropTypes.number,
				visitors: PropTypes.number,
				visits: PropTypes.number,
			} )
		),
		queries: PropTypes.shape( {
			comments: PropTypes.object,
			likes: PropTypes.object,
			post_titles: PropTypes.object,
			views: PropTypes.object,
			visitors: PropTypes.object,
		} ),
		isActiveTabLoading: PropTypes.bool,
	};

	state = {
		activeLegendCharts: null,
		activeTab: null,
	};

	static getDerivedStateFromProps( props, state ) {
		const activeTab = StatModuleChartTabs.getActiveTab( props );
		const activeLegendCharts = activeTab.legendOptions ? activeTab.legendOptions.slice() : [];

		if ( activeTab !== state.activeTab ) {
			return { activeLegendCharts, activeTab };
		}
		return null;
	}

	static getActiveTab( props ) {
		return find( props.charts, { attr: props.chartTab } ) || props.charts[ 0 ];
	}

	buildTooltipData( item ) {
		const tooltipData = [];

		const dateLabel = formatDate( item.data.period, this.props.period.period );
		tooltipData.push( {
			label: dateLabel,
			className: 'is-date-label',
			value: null,
		} );

		switch ( this.props.chartTab ) {
			case 'comments':
				tooltipData.push( {
					label: this.props.translate( 'Comments' ),
					value: this.props.numberFormat( item.value ),
					className: 'is-comments',
					icon: 'comment',
				} );
				break;

			case 'likes':
				tooltipData.push( {
					label: this.props.translate( 'Likes' ),
					value: this.props.numberFormat( item.value ),
					className: 'is-likes',
					icon: 'star',
				} );
				break;

			default:
				tooltipData.push( {
					label: this.props.translate( 'Views' ),
					value: this.props.numberFormat( item.data.views ),
					className: 'is-views',
					icon: 'visible',
				} );
				tooltipData.push( {
					label: this.props.translate( 'Visitors' ),
					value: this.props.numberFormat( item.data.visitors ),
					className: 'is-visitors',
					icon: 'user',
				} );
				tooltipData.push( {
					label: this.props.translate( 'Views Per Visitor' ),
					value: this.props.numberFormat( item.data.views / item.data.visitors, { decimals: 2 } ),
					className: 'is-views-per-visitor',
					icon: 'chevron-right',
				} );

				if ( item.data.post_titles && item.data.post_titles.length ) {
					tooltipData.push( {
						label: this.props.translate( 'Posts Published' ),
						value: this.props.numberFormat( item.data.post_titles.length ),
						className: 'is-published-nolist',
						icon: 'posts',
					} );
				}
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
			'Stats',
			`Toggled Nested Chart ${ chartItem } ${ gaEventAction }`
		);
		this.setState( {
			activeLegendCharts,
		} );
	};

	buildChartData() {
		const { data } = this.props;
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

			let nestedValue;
			if ( this.state.activeLegendCharts.length ) {
				nestedValue = record[ this.state.activeLegendCharts[ 0 ] ];
			}

			const className = classNames( recordClassName, {
				'is-selected': record.period === this.props.queryDate,
			} );

			const item = {
				label: record[ labelKey ],
				value: record[ activeTab ],
				data: record,
				nestedValue,
				className,
			};
			item.tooltipData = this.buildTooltipData( item );

			return item;
		} );
	}

	renderQueries() {
		return (
			this.props.siteId &&
			Object.values( this.props.queries ).map( q => (
				<QuerySiteStats
					key={ q.stat_fields }
					query={ q }
					siteId={ this.props.siteId }
					statType="statsVisits"
				/>
			) )
		);
	}

	render() {
		const { isActiveTabLoading } = this.props;

		return (
			<Card
				className={ classNames( [
					'stats-module is-chart-tabs',
					{ 'is-loading': isActiveTabLoading },
				] ) }
			>
				{ this.renderQueries() }
				<Legend
					activeCharts={ this.state.activeLegendCharts }
					activeTab={ StatModuleChartTabs.getActiveTab( this.props ) }
					availableCharts={ this.state.activeLegendCharts }
					clickHandler={ this.onLegendClick }
					tabs={ this.props.charts }
				/>
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
				<StatsModulePlaceholder className="is-chart" isLoading={ isActiveTabLoading } />
				<Chart
					barClick={ this.props.barClick }
					data={ this.buildChartData() }
					loading={ isActiveTabLoading }
				/>
				<StatTabs
					activeIndex={ this.props.queryDate }
					activeKey="period"
					data={ this.props.data }
					selectedTab={ this.props.chartTab }
					switchTab={ this.props.switchTab }
					tabs={ this.props.charts }
				/>
			</Card>
		);
	}
}

const connectComponent = connect(
	( state, { period: { period }, chartTab, queryDate } ) => {
		const siteId = getSelectedSiteId( state );
		if ( ! siteId ) {
			return { siteId, data: [] };
		}

		const quantity = 'year' === period ? 10 : 30;
		const timezoneOffset = getSiteOption( state, siteId, 'gmt_offset' ) || 0;
		const date = getQueryDate( queryDate, timezoneOffset, period, quantity );
		const queries = generateQueries( period, date, quantity );
		const data = getMergedData( state, siteId, queries );
		const isRequesting = getRequestStatuses( state, siteId, queries );

		return {
			data,
			isActiveTabLoading: isRequesting[ chartTab ] && ! ( data && data.length ),
			isRequesting,
			queries,
			siteId,
		};
	},
	{ recordGoogleEvent },
	null,
	{
		areStatePropsEqual: compareProps( { deep: [ 'siteId', 'isRequesting' ] } ),
	}
);

export default flowRight(
	localize,
	connectComponent
)( StatModuleChartTabs );
