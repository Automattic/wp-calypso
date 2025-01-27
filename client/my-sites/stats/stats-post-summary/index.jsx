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
import DatePicker from '../stats-date-picker';
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

	static MAX_RECORDS_PER_DAY = 10;

	state = {
		selectedRecord: null,
		period: 'day',
		page: 1,
	};

	selectPeriod( period ) {
		return () =>
			this.setState( {
				selectedRecord: null,
				period,
			} );
	}

	selectRecord = ( record ) => {
		this.setState( { selectedRecord: record } );
	};

	onPeriodChange = ( { direction } ) => {
		let chartData = this.getChartData();
		if ( ! chartData.length ) {
			return;
		}

		let selectedRecord = this.state.selectedRecord;
		if ( ! selectedRecord ) {
			selectedRecord = chartData[ chartData.length - 1 ];
		}

		const recordIndex = chartData.findIndex( ( item ) => item.period === selectedRecord.period );

		if ( 'previous' === direction ) {
			if ( recordIndex > 0 ) {
				this.setState( { selectedRecord: chartData[ recordIndex - 1 ] } );
			} else {
				const nextPage = this.state.page + 1;
				chartData = this.getChartData( nextPage );
				if ( chartData ) {
					this.setState( { selectedRecord: chartData[ chartData.length - 1 ] } );
				}
			}
		} else if ( 'next' === direction ) {
			if ( recordIndex < chartData.length - 1 ) {
				this.setState( { selectedRecord: chartData[ recordIndex + 1 ] } );
			} else {
				const nextPage = this.state.page - 1;
				chartData = this.getChartData( nextPage );
				this.setState( { selectedRecord: chartData[ 0 ] } );
			}
		}
	};

	getChartData( newPage = 0 ) {
		const { moment, stats } = this.props;
		if ( ! stats ) {
			return [];
		}

		let page = this.state.page;
		if ( newPage ) {
			page = newPage;
			this.setState( { page: newPage } );
		}

		switch ( this.state.period ) {
			case 'day': {
				if ( ! stats.data ) {
					return [];
				}

				const dataStart = Math.max(
					stats.data.length - StatsPostSummary.MAX_RECORDS_PER_DAY * page,
					0
				);
				const dataEnd = Math.max(
					stats.data.length - StatsPostSummary.MAX_RECORDS_PER_DAY * ( page - 1 ),
					0
				);
				return stats.data.slice( dataStart, dataEnd ).map( ( [ date, value ] ) => {
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

	getQuery() {
		let selectedRecord = this.state.selectedRecord;
		const { period } = this.state;
		const { moment } = this.props;
		const query = {
			period,
			max: 0,
		};

		if ( ! selectedRecord ) {
			const chartData = this.getChartData();

			if ( chartData.length ) {
				selectedRecord = chartData[ chartData.length - 1 ];
			} else {
				return query;
			}
		}

		let date = selectedRecord.startDate;

		switch ( period ) {
			case 'week':
				date = moment( date ).add( 6, 'days' ).format( 'YYYY/MM/DD' );
				break;
			case 'month':
				date = moment( date ).endOf( 'month' ).format( 'YYYY/MM/DD' );
				break;
			case 'year':
				date = moment( date ).endOf( 'year' ).format( 'YYYY/MM/DD' );
				break;
			case 'day':
			default:
				break;
		}

		return {
			...query,
			date,
		};
	}

	render() {
		const { isRequesting, postId, siteId, translate, stats } = this.props;
		const periods = [
			{ id: 'day', label: translate( 'Days' ) },
			{ id: 'week', label: translate( 'Weeks' ) },
			{ id: 'month', label: translate( 'Months' ) },
			{ id: 'year', label: translate( 'Years' ) },
		];
		const chartData = this.getChartData();
		let selectedRecord = this.state.selectedRecord;
		if ( ! this.state.selectedRecord && chartData.length ) {
			selectedRecord = chartData[ chartData.length - 1 ];
		}

		let disablePreviousArrow = false;
		let disableNextArrow = false;
		const selectedRecordIndex = chartData.findIndex(
			( item ) => item.period === selectedRecord.period
		);
		if ( 'day' === this.state.period && stats.data ) {
			const maxPages = Math.ceil( stats.data.length / StatsPostSummary.MAX_RECORDS_PER_DAY );
			disablePreviousArrow = this.state.page >= maxPages && selectedRecordIndex === 0;
			disableNextArrow = 1 === this.state.page && selectedRecordIndex === chartData.length - 1;
		} else {
			disablePreviousArrow = selectedRecordIndex === 0;
			disableNextArrow = selectedRecordIndex === chartData.length - 1;
		}

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
							<DatePicker period={ this.state.period } date={ selectedRecord?.startDate } isShort />
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
						selected={ selectedRecord }
						onClick={ this.selectRecord }
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
