/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { findIndex, findLastIndex, flatten, flowRight, get, range } from 'lodash';

/**
 * Internal dependencies
 */
import SummaryChart from '../stats-summary';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import QueryPostStats from 'components/data/query-post-stats';
import { getPostStats } from 'state/stats/posts/selectors';

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
		return () => this.setState( {
			selectedRecord: undefined,
			period
		} );
	}

	selectRecord = record => {
		this.setState( { selectedRecord: record } );
	};

	getChartData() {
		const { moment, stats } = this.props;
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
						return {
							period: moment( date ).format( 'MMM D' ),
							value,
						};
					} );
			case 'year':
				if ( ! stats.years ) {
					return [];
				}

				return Object.keys( stats.years ).map( year => {
					return {
						period: year,
						value: stats.years[ year ].total,
					};
				} );
			case 'month':
				if ( ! stats.years ) {
					return [];
				}

				const months = flatten(
					Object.keys( stats.years ).map( year => {
						return range( 1, 13 ).map( month => {
							return {
								period: moment( `1/${ month }/${ year }`, 'DD/MM/YYYY' ).format( 'MMM YYYY' ),
								value: get( stats.years, [ year, 'months', month ], 0 )
							};
						} );
					} )
				);
				const firstNotEmpty = findIndex( months, item => item.value !== 0 );
				const lastNotEmpty = findLastIndex( months, item => item.value !== 0 );

				return months.slice( firstNotEmpty, lastNotEmpty + 1 );
			case 'week':
				if ( ! stats.weeks ) {
					return [];
				}

				return stats.weeks.map( week => {
					const firstDay = week.days[ 0 ].day;
					return {
						period: moment( firstDay ).format( 'MMM D' ),
						value: week.total,
					};
				} );
			default:
				return [];
		}
	}

	render() {
		const { postId, siteId, translate } = this.props;
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
					<NavTabs label={ translate( 'Post Stats' ) }>
						{ periods.map( ( { id, label } ) =>
							<NavItem key={ id } onClick={ this.selectPeriod( id ) } selected={ this.state.period === id }>
								{ label }
							</NavItem>
						) }
					</NavTabs>
				</SectionNav>

				<SummaryChart
					isLoading={ false }
					data={ chartData }
					selected={ selectedRecord }
					activeKey="period"
					dataKey="value"
					labelKey="period"
					labelClass="visible"
					sectionClass="is-views"
					tabLabel={ translate( 'Views' ) }
					onClick={ this.selectRecord }
				/>
			</div>
		);
	}
}

const connectComponent = connect(
	( state, { siteId, postId } ) => {
		return {
			stats: getPostStats( state, siteId, postId ),
		};
	}
);

export default flowRight(
	connectComponent,
	localize
)( StatsPostSummary );
