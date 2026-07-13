import { SegmentedControl } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryPostStats from 'calypso/components/data/query-post-stats';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { getPostStats, isRequestingPostStats } from 'calypso/state/stats/posts/selectors';
import { STATS_SUMMARY_MAX_BARS } from '../constants';
import StatsModuleUTM from '../features/modules/stats-utm';
import { StatsGlobalValuesContext } from '../pages/providers/global-provider';
import DatePicker from '../stats-date-label';
import StatsPeriodHeader from '../stats-period-header';
import StatsPeriodNavigation from '../stats-period-navigation';
import SummaryChart from '../stats-summary';

import './style.scss';

class StatsPostSummary extends Component {
	static propTypes = {
		postId: PropTypes.number,
		siteId: PropTypes.number,
		translate: PropTypes.func,
		supportsUTMStats: PropTypes.bool,
	};

	state = {
		period: 'day',
		page: 1,
	};

	selectPeriod( period ) {
		return () =>
			this.setState( {
				period,
				page: 1,
			} );
	}

	// Arrows page the whole visible window of bars (like the Traffic chart's
	// date-range navigation), they never step through individual bars.
	onPeriodChange = ( { direction } ) => {
		const maxPages = this.getMaxPages();
		if ( 'previous' === direction && this.state.page < maxPages ) {
			this.setState( { page: this.state.page + 1 } );
		} else if ( 'next' === direction && this.state.page > 1 ) {
			this.setState( { page: this.state.page - 1 } );
		}
	};

	getMaxPages() {
		const totalRecords = this.getAllRecordsForPeriod().length;
		return Math.max( Math.ceil( totalRecords / STATS_SUMMARY_MAX_BARS ), 1 );
	}

	// Weeks/months/years are aggregated from the full daily history
	// (stats.data) rather than the API's own weeks/years breakdowns, which
	// only cover a recent trailing window (e.g. the last 7 weeks, or years
	// since 2021 even for a post from 2009) instead of the post's full
	// lifetime — which left paging with nowhere further to go.
	getAllRecordsForPeriod() {
		const { moment, stats } = this.props;
		if ( ! stats?.data ) {
			return [];
		}

		const { period } = this.state;

		if ( period === 'day' ) {
			return stats.data.map( ( [ date, value ] ) => {
				const momentDate = moment( date );
				return {
					period: momentDate.format( 'MMM D' ),
					periodLabel: momentDate.format( 'LL' ),
					startDate: date,
					value,
				};
			} );
		}

		const unit = period === 'week' ? 'isoWeek' : period;
		const totals = new Map();
		for ( const [ date, value ] of stats.data ) {
			const key = moment( date ).startOf( unit ).format( 'YYYY-MM-DD' );
			totals.set( key, ( totals.get( key ) ?? 0 ) + value );
		}

		return Array.from( totals.entries() )
			.sort( ( [ a ], [ b ] ) => ( a < b ? -1 : 1 ) )
			.map( ( [ key, value ] ) => {
				const start = moment( key );
				switch ( period ) {
					case 'week':
						return {
							period: start.format( 'MMM D' ),
							periodLabel:
								start.format( 'L' ) + ' - ' + moment( key ).add( 6, 'days' ).format( 'L' ),
							startDate: key,
							value,
						};
					case 'month':
						return {
							period: start.format( 'MMM YYYY' ),
							periodLabel: start.format( 'MMMM YYYY' ),
							startDate: key,
							value,
						};
					default:
						return {
							period: start.format( 'YYYY' ),
							periodLabel: start.format( 'YYYY' ),
							startDate: key,
							value,
						};
				}
			} );
	}

	getChartData() {
		const allRecords = this.getAllRecordsForPeriod();
		if ( ! allRecords.length ) {
			return [];
		}

		const { page } = this.state;
		const dataStart = Math.max( allRecords.length - STATS_SUMMARY_MAX_BARS * page, 0 );
		const dataEnd = Math.max( allRecords.length - STATS_SUMMARY_MAX_BARS * ( page - 1 ), 0 );
		return allRecords.slice( dataStart, dataEnd );
	}

	// The start/end of the currently displayed page of bars, used to keep the
	// header label and the UTM breakdown showing the same range (mirrors the
	// Traffic page's start_date/date/summarize query for its date-range UTM
	// module) instead of a single selected bar.
	getPageDateRange() {
		const { period } = this.state;
		const { moment } = this.props;
		const chartData = this.getChartData();

		if ( ! chartData.length ) {
			return null;
		}

		const start = moment( chartData[ 0 ].startDate );
		const end = moment( chartData[ chartData.length - 1 ].startDate );

		switch ( period ) {
			case 'week':
				end.add( 6, 'days' );
				break;
			case 'month':
				end.endOf( 'month' );
				break;
			case 'year':
				end.endOf( 'year' );
				break;
			default:
				break;
		}

		return { start, end };
	}

	getQuery() {
		const dateRange = this.getPageDateRange();
		if ( ! dateRange ) {
			return { period: 'day', max: 0, summarize: 1 };
		}

		return {
			period: 'day',
			start_date: dateRange.start.format( 'YYYY-MM-DD' ),
			date: dateRange.end.format( 'YYYY-MM-DD' ),
			summarize: 1,
			max: 0,
		};
	}

	render() {
		const { isRequesting, postId, siteId, translate } = this.props;
		const periods = [
			{ id: 'day', label: translate( 'Days' ) },
			{ id: 'week', label: translate( 'Weeks' ) },
			{ id: 'month', label: translate( 'Months' ) },
			{ id: 'year', label: translate( 'Years' ) },
		];
		const chartData = this.getChartData();
		const pageDateRange = this.getPageDateRange();

		const disablePreviousArrow = this.state.page >= this.getMaxPages();
		const disableNextArrow = this.state.page <= 1;

		const summaryWrapperClass = clsx( 'stats-post-summary', 'is-chart-tabs', {
			'is-period-year': this.state.period === 'year',
		} );

		return (
			<>
				<div className={ summaryWrapperClass }>
					<QueryPostStats siteId={ siteId } postId={ postId } />

					<StatsPeriodHeader>
						<StatsPeriodNavigation
							showArrows
							onPeriodChange={ this.onPeriodChange }
							disablePreviousArrow={ disablePreviousArrow }
							disableNextArrow={ disableNextArrow }
							date={ null }
						>
							<DatePicker
								period={ this.state.period }
								dateRange={
									pageDateRange
										? {
												chartStart: pageDateRange.start.format( 'YYYY-MM-DD' ),
												chartEnd: pageDateRange.end.format( 'YYYY-MM-DD' ),
										  }
										: undefined
								}
								isShort
							/>
						</StatsPeriodNavigation>
						<SegmentedControl primary>
							{ periods.map( ( { id, label } ) => (
								<SegmentedControl.Item
									key={ id }
									onClick={ this.selectPeriod( id ) }
									selected={ this.state.period === id }
								>
									{ label }
								</SegmentedControl.Item>
							) ) }
						</SegmentedControl>
					</StatsPeriodHeader>

					<SummaryChart
						isLoading={ isRequesting && ! chartData.length }
						data={ chartData }
						activeKey="period"
						dataKey="value"
						labelKey="periodLabel"
						chartType="views"
						sectionClass="is-views"
						tabLabel={ translate( 'Views' ) }
						type="post"
					/>
				</div>

				<StatsGlobalValuesContext.Consumer>
					{ ( isInternal ) =>
						( this.props.supportsUTMStats || isInternal ) && (
							<div className="stats-module-utm__post-detail">
								<StatsModuleUTM
									siteId={ siteId }
									postId={ postId }
									period={ this.state.period }
									query={ this.getQuery() }
									context={ this.props.context }
								/>
							</div>
						)
					}
				</StatsGlobalValuesContext.Consumer>
			</>
		);
	}
}

export default connect( ( state, { siteId, postId } ) => ( {
	stats: getPostStats( state, siteId, postId ),
	isRequesting: isRequestingPostStats( state, siteId, postId ),
} ) )( localize( withLocalizedMoment( StatsPostSummary ) ) );
