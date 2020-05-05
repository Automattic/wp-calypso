/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { findIndex, findLastIndex, flatten, flowRight, get, range } from 'lodash';

/**
 * Internal dependencies
 */
import SummaryChart from '../stats-summary';
import SectionNav from 'components/section-nav';
import SegmentedControl from 'components/segmented-control';
import QueryPostStats from 'components/data/query-post-stats';
import { withLocalizedMoment } from 'components/localized-moment';
import { getPostStats, isRequestingPostStats } from 'state/stats/posts/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class StatsPostSummary extends Component {
	static propTypes = {
		postId: PropTypes.number,
		siteId: PropTypes.number,
		translate: PropTypes.func,
	};

	state = {
		period: 'day',
	};

	selectPeriod( period ) {
		return () =>
			this.setState( {
				selectedRecord: undefined,
				period,
			} );
	}

	selectRecord = ( record ) => {
		this.setState( { selectedRecord: record } );
	};

	getChartData() {
		const { moment, stats } = this.props;
		if ( ! stats ) {
			return [];
		}

		switch ( this.state.period ) {
			case 'day':
				if ( ! stats.data ) {
					return [];
				}

				return stats.data
					.slice( Math.max( stats.data.length - 10, 1 ) )
					.map( ( [ date, value ] ) => {
						const momentDate = moment( date );
						return {
							period: momentDate.format( 'MMM D' ),
							periodLabel: momentDate.format( 'LL' ),
							value,
						};
					} );
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

				const months = flatten(
					Object.keys( stats.years ).map( ( year ) => {
						return range( 1, 13 ).map( ( month ) => {
							const firstDayOfMonth = moment( `1/${ month }/${ year }`, 'DD/MM/YYYY' );
							return {
								period: firstDayOfMonth.format( 'MMM YYYY' ),
								periodLabel: firstDayOfMonth.format( 'MMMM YYYY' ),
								value: get( stats.years, [ year, 'months', month ], 0 ),
							};
						} );
					} )
				);
				const firstNotEmpty = findIndex( months, ( item ) => item.value !== 0 );
				const lastNotEmpty = findLastIndex( months, ( item ) => item.value !== 0 );

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
						value: week.total,
					};
				} );
			default:
				return [];
		}
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
		let selectedRecord = this.state.selectedRecord;
		if ( ! this.state.selectedRecord && chartData.length ) {
			selectedRecord = chartData[ chartData.length - 1 ];
		}

		return (
			<div className="stats-post-summary">
				<QueryPostStats siteId={ siteId } postId={ postId } />
				<SectionNav>
					<SegmentedControl compact>
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
				</SectionNav>

				<SummaryChart
					isLoading={ isRequesting && ! chartData.length }
					data={ chartData }
					selected={ selectedRecord }
					activeKey="period"
					dataKey="value"
					labelKey="periodLabel"
					labelClass="visible"
					sectionClass="is-views"
					tabLabel={ translate( 'Views' ) }
					onClick={ this.selectRecord }
				/>
			</div>
		);
	}
}

const connectComponent = connect( ( state, { siteId, postId } ) => {
	return {
		stats: getPostStats( state, siteId, postId ),
		isRequesting: isRequestingPostStats( state, siteId, postId ),
	};
} );

export default flowRight( connectComponent, localize, withLocalizedMoment )( StatsPostSummary );
