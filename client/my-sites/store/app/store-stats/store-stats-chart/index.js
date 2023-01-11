import { Icon, currencyDollar } from '@wordpress/icons';
import classNames from 'classnames';
import { findIndex, find } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ElementChart from 'calypso/components/chart';
import Legend from 'calypso/components/chart/legend';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import StatsEmptyState from '../../../../stats/stats-empty-state';
import { recordTrack } from '../../../lib/analytics';
import { UNITS } from '../constants';
import { getWidgetPath, formatValue } from '../utils';

class StoreStatsChart extends Component {
	static propTypes = {
		className: PropTypes.string,
		basePath: PropTypes.string.isRequired,
		data: PropTypes.array.isRequired,
		renderTabs: PropTypes.func.isRequired,
		selectedDate: PropTypes.string.isRequired,
		slug: PropTypes.string,
		tabs: PropTypes.array.isRequired,
		unit: PropTypes.string.isRequired,
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

	barClick = ( bar ) => {
		const { unit, slug, basePath, urlQueryParam } = this.props;
		const query = Object.assign( { startDate: bar.data.period }, urlQueryParam );
		const path = getWidgetPath( unit, slug, query );
		page( `${ basePath }${ path }` );
	};

	tabClick = ( tab ) => {
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

	legendClick = ( attr ) => {
		const activeCharts = this.state.activeCharts.indexOf( attr ) === -1 ? [ attr ] : [];
		this.setState( {
			activeCharts,
		} );
	};

	createTooltipDate = ( item ) => {
		const { unit, moment } = this.props;
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
				icon: (
					<svg
						className="gridicon"
						width="25"
						height="25"
						viewBox="0 0 25 25"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M6 10V8H19V10H6ZM6 13V17H19V13H6ZM4.5 7.5C4.5 6.94772 4.94772 6.5 5.5 6.5H19.5C20.0523 6.5 20.5 6.94772 20.5 7.5V17.5C20.5 18.0523 20.0523 18.5 19.5 18.5H5.5C4.94772 18.5 4.5 18.0523 4.5 17.5V7.5Z"
							fill="#fff"
						/>
					</svg>
				),
			},
		];
		activeCharts.forEach( ( attr ) => {
			data.push( {
				value: formatValue( item[ attr ], selectedTab.type, item.currency ),
				label: find( tabs, ( tab ) => tab.attr === attr ).label,
				icon: <Icon className="gridicon" icon={ currencyDollar } />,
			} );
		} );
		return data;
	};

	buildChartData = ( item, selectedTab, chartFormat ) => {
		const { selectedDate } = this.props;
		const { activeCharts } = this.state;
		const className = classNames( item.classNames.join( ' ' ), {
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

	renderLegend = ( selectedTabIndex ) => {
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
		const { className, data, renderTabs, selectedDate, tabs, unit } = this.props;
		const { selectedTabIndex } = this.state;
		const selectedTab = tabs[ selectedTabIndex ];
		const isLoading = ! data.length;
		const chartFormat = UNITS[ unit ].chartFormat;
		const chartData = data.map( ( item ) => this.buildChartData( item, selectedTab, chartFormat ) );
		const selectedIndex = findIndex( data, ( d ) => d.period === selectedDate );

		const classes = classNames( 'is-chart-tabs', className, {
			'is-loading': isLoading,
		} );

		return (
			<div className={ classes }>
				{ this.renderLegend( selectedTabIndex ) }
				<ElementChart
					loading={ isLoading }
					data={ chartData }
					barClick={ this.barClick }
					minBarWidth={ 35 }
				>
					<StatsEmptyState stateType={ selectedTab.label } />
				</ElementChart>
				{ ! isLoading &&
					renderTabs( {
						chartData,
						selectedIndex,
						selectedTabIndex,
						selectedDate,
						unit,
						tabClick: this.tabClick,
					} ) }
			</div>
		);
	}
}
export default withLocalizedMoment( StoreStatsChart );
