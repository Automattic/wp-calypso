/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ElementChart from 'components/chart';
import Legend from 'components/chart/legend';
import StatTabs from '../stats-tabs';
import analytics from 'lib/analytics';
import observe from 'lib/mixins/data-observe';
import StatsModulePlaceholder from '../stats-module/placeholder';
import Card from 'components/card';

export default React.createClass( {
	displayName: 'StatModuleChartTabs',

	mixins: [ observe( 'visitsList', 'activeTabVisitsList' ) ],

	getInitialState: function() {
		var activeTab = this.getActiveTab(),
			activeCharts = activeTab.legendOptions.slice() || [];

		return {
			activeLegendCharts: activeCharts,
			activeTab: activeTab
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		var activeTab = this.getActiveTab( nextProps ),
			activeCharts = activeTab.legendOptions ? activeTab.legendOptions.slice() : [];

		if ( activeTab !== this.state.activeTab ) {
			this.setState( {
				activeLegendCharts: activeCharts,
				activeTab: activeTab
			} );
		}
	},

	buildTooltipData: function( item ) {
		var tooltipData = [],
			date = this.moment( item.data.period ),
			dateLabel;

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
					label: this.translate( 'Comments' ),
					value: this.numberFormat( item.value ),
					className: 'is-comments',
					icon: 'comment'
				} );
				break;

			case 'likes':
				tooltipData.push( {
					label: this.translate( 'Likes' ),
					value: this.numberFormat( item.value ),
					className: 'is-likes',
					icon: 'star'
				} );
				break;

			default:
				tooltipData.push( {
					label: this.translate( 'Views' ),
					value: this.numberFormat( item.data.views ),
					className: 'is-views',
					icon: 'visible'
				} );
				tooltipData.push( {
					label: this.translate( 'Visitors' ),
					value: this.numberFormat( item.data.visitors ),
					className: 'is-visitors',
					icon: 'user'
				} );
				tooltipData.push( {
					label: this.translate( 'Views Per Visitor' ),
					value: this.numberFormat( ( item.data.views / item.data.visitors ), { decimals: 2 } ),
					className: 'is-views-per-visitor',
					icon: 'chevron-right'
				} );

				if ( item.data.post_titles && item.data.post_titles.length ) {
					// only show two post titles
					if ( item.data.post_titles.length > 2 ) {
						tooltipData.push( {
							label: this.translate( 'Posts Published' ),
							value: this.numberFormat( item.data.post_titles.length ),
							className: 'is-published-nolist',
							icon: 'posts'
						} );
					} else {
						tooltipData.push( {
							label: this.translate( 'Post Published', 'Posts Published', { textOnly: true, count: item.data.post_titles.length } ) + ':',
							className: 'is-published',
							icon: 'posts',
							value: ''
						} );
						item.data.post_titles.forEach( function( post_title ) {
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
	},

	onLegendClick: function( chartItem ) {
		var activeLegendCharts = this.state.activeLegendCharts,
			chartIndex = activeLegendCharts.indexOf( chartItem ),
			gaEvent = 'Toggled Nested Chart ' + chartItem,
			gaEventAction;
		if ( -1 === chartIndex ) {
			activeLegendCharts.push( chartItem );
			gaEventAction = ' on';
		} else {
			activeLegendCharts.splice( chartIndex );
			gaEventAction = ' off';
		}

		analytics.ga.recordEvent( 'Stats', gaEvent + gaEventAction );
		this.setState( {
			activeLegendCharts: activeLegendCharts
		} );
	},

	getActiveTab: function( nextProps ) {
		var props = nextProps || this.props;

		return props.charts.filter( function( chart ) {
			return chart.attr === props.chartTab;
		}, this ).shift();
	},

	buildChartData: function() {
		var chartData,
			labelKey,
			dataList = 'visitsList',
			activeTab = this.props.chartTab;

		labelKey = 'label' + this.props.period.period.charAt( 0 ).toUpperCase() + this.props.period.period.slice( 1 );

		if ( this.props.visitsList.isLoading() ) {
			dataList = 'activeTabVisitsList';
		}

		chartData = this.props[ dataList ].response.data.map( function( record ) {
			var chartDataItem,
				recordClassName,
				className,
				nestedValue;

			if ( record.classNames && record.classNames.length ) {
				recordClassName = record.classNames.join( ' ' );
			}

			if ( this.state.activeLegendCharts.length ) {
				nestedValue = record[ this.state.activeLegendCharts[ 0 ] ];
			}

			className = classNames( recordClassName, {
				'is-selected': record.period === this.props.queryDate
			} );

			chartDataItem = {
				label: record[ labelKey ],
				value: record[ activeTab ],
				nestedValue: nestedValue,
				className: className,
				data: record
			};

			chartDataItem.tooltipData = this.buildTooltipData( chartDataItem );
			return chartDataItem;
		}, this );

		return chartData;
	},

	render: function() {
		var data = this.buildChartData(),
			activeTab = this.getActiveTab(),
			dataKeys = [ this.props.chartTab ],
			visitsList = this.props.visitsList,
			availableCharts = [],
			activeTabLoading = this.props.activeTabVisitsList.isLoading() && this.props.visitsList.isLoading(),
			classes;

		classes = [
			'stats-module',
			'is-chart-tabs',
			{
				'is-loading': activeTabLoading
			}
		];

		if ( visitsList.isLoading() ) {
			visitsList = this.props.activeTabVisitsList;
		}

		if ( activeTab.legendOptions ) {
			dataKeys = dataKeys.concat( this.state.activeLegendCharts );
			availableCharts = activeTab.legendOptions;
		}

		return (
			<div>
				<Card className={ classNames.apply( null, classes ) }>
					<Legend tabs={ this.props.charts } activeTab={ activeTab } availableCharts={ availableCharts } activeCharts={ this.state.activeLegendCharts } clickHandler={ this.onLegendClick } />
					<StatsModulePlaceholder className="is-chart" isLoading={ activeTabLoading } />
					<ElementChart loading={ activeTabLoading } data={ data } barClick={ this.props.barClick } />
					<StatTabs dataList={ visitsList } tabs={ this.props.charts } switchTab={ this.props.switchTab } selectedTab={ this.props.chartTab } activeIndex={ this.props.queryDate } activeKey="period" />
				</Card>
			</div>
		);
	}
} );
