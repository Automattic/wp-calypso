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

function* statsByMonth( stats, moment ) {
	for ( const year of Object.keys( stats.years ) ) {
		for ( let month = 1; month <= 12; month++ ) {
			const firstDayOfMonth = moment( `1/${ month }/${ year }`, 'DD/MM/YYYY' );
			yield {
				period: firstDayOfMonth.format( 'MMM YYYY' ),
				periodLabel: firstDayOfMonth.format( 'MMMM YYYY' ),
				startDate: firstDayOfMonth.format( 'YYYY-MM-DD' ),
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
		return Math.max( Math.ceil( this.getTotalRecordCount() / STATS_SUMMARY_MAX_BARS ), 1 );
	}

	// Days can run to thousands of entries for an old post, so their count is
	// read directly off stats.data rather than built into record objects.
	getTotalRecordCount() {
		return this.state.period === 'day'
			? this.props.stats?.data?.length ?? 0
			: this.getAllRecordsForPeriod().length;
	}

	// [start, end) slice bounds for the current page within a period's full,
	// most-recent-last record list.
	getPageSliceBounds( totalCount ) {
		const { page } = this.state;
		const dataStart = Math.max( totalCount - STATS_SUMMARY_MAX_BARS * page, 0 );
		const dataEnd = Math.max( totalCount - STATS_SUMMARY_MAX_BARS * ( page - 1 ), 0 );
		return [ dataStart, dataEnd ];
	}

	// Days are paged directly off the raw stats.data pairs, formatting only
	// the bars for the current page rather than the post's entire history.
	getPagedDayRecords() {
		const { moment, stats } = this.props;
		const data = stats?.data ?? [];
		const [ dataStart, dataEnd ] = this.getPageSliceBounds( data.length );

		const records = data.slice( dataStart, dataEnd ).map( ( [ date, value ] ) => {
			const momentDate = moment( date );
			return {
				period: momentDate.format( 'MMM D' ),
				periodLabel: momentDate.format( 'LL' ),
				startDate: date,
				value,
			};
		} );

		return { records, totalCount: data.length };
	}

	// The current page of bars for the active period, plus the total record
	// count it was sliced from (used to compute max pages).
	getPagedRecords() {
		if ( this.state.period === 'day' ) {
			return this.getPagedDayRecords();
		}

		const allRecords = this.getAllRecordsForPeriod();
		const [ dataStart, dataEnd ] = this.getPageSliceBounds( allRecords.length );
		return { records: allRecords.slice( dataStart, dataEnd ), totalCount: allRecords.length };
	}

	getAllRecordsForPeriod() {
		const { moment, stats } = this.props;
		if ( ! stats ) {
			return [];
		}

		switch ( this.state.period ) {
			// stats.weeks only ever covers a fixed recent 7-week window
			// (hard-coded server-side; no request param widens it — see
			// WPCOM_JSON_API_Stats_V1_1_Post_Views_Endpoint), so weeks are
			// aggregated from the full daily history instead, to allow
			// paging back to the post's actual publish date.
			case 'week': {
				if ( ! stats.data ) {
					return [];
				}

				const totals = new Map();
				for ( const [ date, value ] of stats.data ) {
					const key = moment( date ).startOf( 'isoWeek' ).format( 'YYYY-MM-DD' );
					totals.set( key, ( totals.get( key ) ?? 0 ) + value );
				}

				return Array.from( totals.entries() )
					.sort( ( [ a ], [ b ] ) => a.localeCompare( b ) )
					.map( ( [ key, value ] ) => {
						const start = moment( key );
						return {
							period: start.format( 'MMM D' ),
							periodLabel:
								start.format( 'L' ) + ' - ' + moment( key ).add( 6, 'days' ).format( 'L' ),
							startDate: key,
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
						startDate: moment( year, 'YYYY' ).startOf( 'year' ).format( 'YYYY-MM-DD' ),
						value: stats.years[ year ].total,
					};
				} );
			case 'month': {
				if ( ! stats.years ) {
					return [];
				}

				// statsByMonth() expands every year in stats.years to a full
				// 12 months, which for the current year includes months that
				// haven't happened yet; drop those rather than paginating
				// into fake future bars.
				const today = moment();
				return [ ...statsByMonth( stats, moment ) ].filter( ( record ) =>
					moment( record.startDate ).isSameOrBefore( today, 'month' )
				);
			}
			default:
				return [];
		}
	}

	// The start/end of a page of bars, used to keep the header label and the
	// UTM breakdown showing the same range (mirrors the Traffic page's
	// start_date/date/summarize query for its date-range UTM module) instead
	// of a single selected bar.
	getPageDateRange( chartData ) {
		const { period } = this.state;
		const { moment } = this.props;

		if ( ! chartData.length ) {
			return null;
		}

		const start = moment( chartData[ 0 ].startDate );
		let end = moment( chartData[ chartData.length - 1 ].startDate );

		switch ( period ) {
			case 'week':
				end = end.add( 6, 'days' );
				break;
			case 'month':
				end = end.endOf( 'month' );
				break;
			case 'year':
				end = end.endOf( 'year' );
				break;
			default:
				break;
		}

		// Don't extend the range into the future when the last bar is still
		// the current, in-progress period (e.g. this month before it ends).
		const today = moment();
		if ( end.isAfter( today, 'day' ) ) {
			end = today;
		}

		return { start, end };
	}

	getQuery( pageDateRange ) {
		if ( ! pageDateRange ) {
			return { period: 'day', max: 0, summarize: 1 };
		}

		return {
			period: 'day',
			start_date: pageDateRange.start.format( 'YYYY-MM-DD' ),
			date: pageDateRange.end.format( 'YYYY-MM-DD' ),
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
		const { records: chartData, totalCount } = this.getPagedRecords();
		const pageDateRange = this.getPageDateRange( chartData );

		const maxPages = Math.max( Math.ceil( totalCount / STATS_SUMMARY_MAX_BARS ), 1 );
		const disablePreviousArrow = this.state.page >= maxPages;
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
									query={ this.getQuery( pageDateRange ) }
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
