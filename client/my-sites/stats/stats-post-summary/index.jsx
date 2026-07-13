import { SegmentedControl } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryPostStats from 'calypso/components/data/query-post-stats';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { getPostStats, isRequestingPostStats } from 'calypso/state/stats/posts/selectors';
import StatsModuleUTM from '../features/modules/stats-utm';
import { StatsGlobalValuesContext } from '../pages/providers/global-provider';
import DatePicker from '../stats-date-label';
import StatsPeriodHeader from '../stats-period-header';
import StatsPeriodNavigation from '../stats-period-navigation';
import SummaryChart from '../stats-summary';

import './style.scss';

function* statsByMonth( stats, moment ) {
	for ( const year of Object.keys( stats.years ) ) {
		for ( let month = 1; month <= 12; month++ ) {
			const firstDayOfMonth = moment( `1/${ month }/${ year }`, 'DD/MM/YYYY' );
			yield {
				period: firstDayOfMonth.format( 'MMM YYYY' ),
				periodLabel: firstDayOfMonth.format( 'MMMM YYYY' ),
				startDate: firstDayOfMonth.format( 'YYYY/MM/DD' ),
				value: stats.years[ year ]?.months[ month ] ?? 0,
			};
		}
	}
}

class StatsPostSummary extends Component {
	static propTypes = {
		postId: PropTypes.number,
		siteId: PropTypes.number,
		translate: PropTypes.func,
		supportsUTMStats: PropTypes.bool,
	};

	static MAX_RECORDS_PER_PAGE = 10;

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
		return Math.max( Math.ceil( totalRecords / StatsPostSummary.MAX_RECORDS_PER_PAGE ), 1 );
	}

	getAllRecordsForPeriod() {
		const { moment, stats } = this.props;
		if ( ! stats ) {
			return [];
		}

		switch ( this.state.period ) {
			case 'day': {
				if ( ! stats.data ) {
					return [];
				}

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
			case 'year':
				if ( ! stats.years ) {
					return [];
				}

				return Object.keys( stats.years ).map( ( year ) => {
					return {
						period: year,
						periodLabel: year,
						startDate: moment( year, 'YYYY' ).startOf( 'year' ).format( 'YYYY/MM/DD' ),
						value: stats.years[ year ].total,
					};
				} );
			case 'month': {
				if ( ! stats.years ) {
					return [];
				}

				const months = [ ...statsByMonth( stats, moment ) ];
				const firstNotEmpty = months.findIndex( ( item ) => item.value !== 0 );
				const reverseLastNotEmpty = [ ...months ]
					.reverse()
					.findIndex( ( item ) => item.value !== 0 );
				const lastNotEmpty =
					reverseLastNotEmpty === -1
						? reverseLastNotEmpty
						: months.length - ( reverseLastNotEmpty + 1 );

				return months.slice( firstNotEmpty, lastNotEmpty + 1 );
			}
			case 'week':
				if ( ! stats.weeks ) {
					return [];
				}

				return stats.weeks.map( ( week ) => {
					const firstDay = moment( week.days[ 0 ].day );
					return {
						period: firstDay.format( 'MMM D' ),
						periodLabel: firstDay.format( 'L' ) + ' - ' + firstDay.add( 6, 'days' ).format( 'L' ),
						startDate: moment( week.days[ 0 ].day ).format( 'YYYY/MM/DD' ),
						value: week.total,
					};
				} );
			default:
				return [];
		}
	}

	getChartData() {
		const allRecords = this.getAllRecordsForPeriod();
		if ( ! allRecords.length ) {
			return [];
		}

		const { page } = this.state;
		const dataStart = Math.max(
			allRecords.length - StatsPostSummary.MAX_RECORDS_PER_PAGE * page,
			0
		);
		const dataEnd = Math.max(
			allRecords.length - StatsPostSummary.MAX_RECORDS_PER_PAGE * ( page - 1 ),
			0
		);
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
			start_date: dateRange.start.format( 'YYYY/MM/DD' ),
			date: dateRange.end.format( 'YYYY/MM/DD' ),
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
