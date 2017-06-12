/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import { find, flowRight } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ElementChart from 'components/chart';
import Legend from 'components/chart/legend';
import StatTabs from '../stats-tabs';
import StatsModulePlaceholder from '../stats-module/placeholder';
import Card from 'components/card';
import QuerySiteStats from 'components/data/query-site-stats';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData
} from 'state/stats/lists/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';
import { rangeOfPeriod } from 'state/stats/lists/utils';
import { getSiteOption } from 'state/sites/selectors';

class StatModuleChartTabs extends Component {
	constructor( props ) {
		super( props );
		const activeTab = this.getActiveTab();
		const activeCharts = activeTab.legendOptions ? activeTab.legendOptions.slice() : [];
		this.state = {
			activeLegendCharts: activeCharts,
			activeTab: activeTab
		};
	}

	componentWillReceiveProps( nextProps ) {
		const activeTab = this.getActiveTab( nextProps );
		const activeCharts = activeTab.legendOptions ? activeTab.legendOptions.slice() : [];
		if ( activeTab !== this.state.activeTab ) {
			this.setState( {
				activeLegendCharts: activeCharts,
				activeTab: activeTab
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
			value: null
		} );

		switch ( this.props.chartTab ) {
			case 'comments':
				tooltipData.push( {
					label: this.props.translate( 'Comments' ),
					value: this.props.numberFormat( item.value ),
					className: 'is-comments',
					icon: 'comment'
				} );
				break;

			case 'likes':
				tooltipData.push( {
					label: this.props.translate( 'Likes' ),
					value: this.props.numberFormat( item.value ),
					className: 'is-likes',
					icon: 'star'
				} );
				break;

			default:
				tooltipData.push( {
					label: this.props.translate( 'Views' ),
					value: this.props.numberFormat( item.data.views ),
					className: 'is-views',
					icon: 'visible'
				} );
				tooltipData.push( {
					label: this.props.translate( 'Visitors' ),
					value: this.props.numberFormat( item.data.visitors ),
					className: 'is-visitors',
					icon: 'user'
				} );
				tooltipData.push( {
					label: this.props.translate( 'Views Per Visitor' ),
					value: this.props.numberFormat( ( item.data.views / item.data.visitors ), { decimals: 2 } ),
					className: 'is-views-per-visitor',
					icon: 'chevron-right'
				} );

				if ( item.data.post_titles && item.data.post_titles.length ) {
					// only show two post titles
					if ( item.data.post_titles.length > 2 ) {
						tooltipData.push( {
							label: this.props.translate( 'Posts Published' ),
							value: this.props.numberFormat( item.data.post_titles.length ),
							className: 'is-published-nolist',
							icon: 'posts'
						} );
					} else {
						tooltipData.push( {
							label: this.props.translate( 'Post Published', 'Posts Published', {
								textOnly: true, count: item.data.post_titles.length
							} ) + ':',
							className: 'is-published',
							icon: 'posts',
							value: ''
						} );
						item.data.post_titles.forEach( ( post_title ) => {
							tooltipData.push( {
								className: 'is-published-item',
								label: post_title
							} );
						} );
					}
				}
				break;
		}

		return tooltipData;
	}

	onLegendClick = ( chartItem ) => {
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
		this.props.recordGoogleEvent( 'Stats', `Toggled Nested Chart ${ chartItem } ${ gaEventAction }` );
		this.setState( {
			activeLegendCharts
		} );
	};

	getActiveTab( nextProps ) {
		const props = nextProps || this.props;
		return find( props.charts, { attr: props.chartTab } ) || props.charts[ 0 ];
	}

	getLoadedData() {
		const { quickQueryData, fullQueryData, fullQueryRequesting } = this.props;
		return fullQueryRequesting ? quickQueryData : fullQueryData;
	}

	buildChartData() {
		const data = this.getLoadedData();
		if ( ! data ) {
			return [];
		}

		const activeTab = this.props.chartTab;
		const labelKey = 'label' + this.props.period.period.charAt( 0 ).toUpperCase() + this.props.period.period.slice( 1 );
		return data.map( ( record ) => {
			let recordClassName;
			if ( record.classNames && record.classNames.length ) {
				recordClassName = record.classNames.join( ' ' );
			}

			let nestedValue;
			if ( this.state.activeLegendCharts.length ) {
				nestedValue = record[ this.state.activeLegendCharts[ 0 ] ];
			}

			const className = classNames( recordClassName, {
				'is-selected': record.period === this.props.queryDate
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

	render() {
		const { fullQuery, quickQuery, quickQueryRequesting, fullQueryRequesting, siteId } = this.props;
		const chartData = this.buildChartData();
		const activeTab = this.getActiveTab();
		let availableCharts = [];
		const data = this.getLoadedData();
		const activeTabLoading = quickQueryRequesting && fullQueryRequesting && ! ( data && data.length );
		const classes = [
			'stats-module',
			'is-chart-tabs',
			{
				'is-loading': activeTabLoading
			}
		];
		if ( activeTab.legendOptions ) {
			availableCharts = activeTab.legendOptions;
		}

		return (
			<div>
				{ siteId && <QuerySiteStats statType="statsVisits" siteId={ siteId } query={ quickQuery } /> }
				{ siteId && <QuerySiteStats statType="statsVisits" siteId={ siteId } query={ fullQuery } /> }
				<Card className={ classNames( ...classes ) }>
					<Legend
						tabs={ this.props.charts }
						activeTab={ activeTab }
						availableCharts={ availableCharts }
						activeCharts={ this.state.activeLegendCharts }
						clickHandler={ this.onLegendClick }
					/>
					<StatsModulePlaceholder className="is-chart" isLoading={ activeTabLoading } />
					<ElementChart loading={ activeTabLoading } data={ chartData } barClick={ this.props.barClick } />
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
			date = moment( date ).subtract( Math.floor( periodDifference / quantity ) * quantity, period ).format( 'YYYY-MM-DD' );
		}

		let quickQueryFields = chartTab;
		// If we are on the default Tab, grab visitors too
		if ( 'views' === quickQueryFields ) {
			quickQueryFields = 'views,visitors';
		}

		const query = {
			unit: period,
			date,
			quantity
		};
		const quickQuery = {
			...query,
			stat_fields: quickQueryFields
		};
		const fullQuery = {
			...query,
			stat_fields: 'views,visitors,likes,comments,post_titles'
		};

		return {
			quickQueryRequesting: isRequestingSiteStatsForQuery( state, siteId, 'statsVisits', quickQuery ),
			quickQueryData: getSiteStatsNormalizedData( state, siteId, 'statsVisits', quickQuery ),
			fullQueryRequesting: isRequestingSiteStatsForQuery( state, siteId, 'statsVisits', fullQuery ),
			fullQueryData: getSiteStatsNormalizedData( state, siteId, 'statsVisits', fullQuery ),
			quickQuery,
			fullQuery,
			siteId
		};
	},
	{ recordGoogleEvent }
);

export default flowRight(
	localize,
	connectComponent,
)( StatModuleChartTabs );
