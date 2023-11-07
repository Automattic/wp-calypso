import classNames from 'classnames';
import { localize, withRtl } from 'i18n-calypso';
import { flowRight } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import qs from 'qs';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import Legend from 'calypso/components/chart/legend';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import StatsDateControl from 'calypso/components/stats-date-control';
import IntervalDropdown from 'calypso/components/stats-interval-dropdown';
import { recordGoogleEvent as recordGoogleEventAction } from 'calypso/state/analytics/actions';
import NavigationArrows from '../navigation-arrows';

import './style.scss';

class StatsPeriodNavigation extends PureComponent {
	static propTypes = {
		onPeriodChange: PropTypes.func,
		showArrows: PropTypes.bool,
		disablePreviousArrow: PropTypes.bool,
		disableNextArrow: PropTypes.bool,
		isRtl: PropTypes.bool,
		queryParams: PropTypes.object,
		startDate: PropTypes.bool,
		endDate: PropTypes.bool,
		isWithNewDateControl: PropTypes.bool,
	};

	static defaultProps = {
		showArrows: true,
		disablePreviousArrow: false,
		disableNextArrow: false,
		isRtl: false,
		queryParams: {},
		startDate: false,
		endDate: false,
		isWithNewDateControl: false,
	};

	handleArrowEvent = ( arrow, href ) => {
		const { date, onPeriodChange, period, recordGoogleEvent } = this.props;
		recordGoogleEvent( 'Stats Period Navigation', `Clicked ${ arrow } ${ period }` );

		if ( onPeriodChange ) {
			onPeriodChange( {
				date,
				direction: arrow,
				period,
			} );
		}

		if ( href ) {
			page( href );
		}
	};

	isHoursPeriod = ( period ) => 'hour' === period;

	getNumberOfDays = ( isEmailStats, period, maxBars ) =>
		isEmailStats && ! this.isHoursPeriod( period ) ? maxBars : 1;

	calculatePeriod = ( period ) => ( this.isHoursPeriod( period ) ? 'day' : period );

	queryParamsForNextDate = ( nextDay ) => {
		const { dateRange, moment, queryParams } = this.props;
		// Takes a 'YYYY-MM-DD' string.
		const newParams = { startDate: nextDay };
		// Maintain previous behaviour if we don't have a date range to work with.
		if ( dateRange === undefined ) {
			return newParams;
		}
		// Test if we need to update the chart start/end dates.
		const isAfter = moment( nextDay ).isAfter( moment( queryParams.chartEnd ) );
		if ( isAfter ) {
			newParams.chartStart = moment( queryParams.chartEnd ).add( 1, 'days' ).format( 'YYYY-MM-DD' );
			newParams.chartEnd = moment( queryParams.chartEnd )
				.add( dateRange.daysInRange, 'days' )
				.format( 'YYYY-MM-DD' );
		}
		return newParams;
	};

	handleArrowNext = () => {
		const { date, moment, period, url, queryParams, isEmailStats, maxBars } = this.props;
		const numberOfDAys = this.getNumberOfDays( isEmailStats, period, maxBars );
		const usedPeriod = this.calculatePeriod( period );
		const nextDay = moment( date ).add( numberOfDAys, usedPeriod ).format( 'YYYY-MM-DD' );
		const newQueryParams = this.queryParamsForNextDate( nextDay );
		const nextDayQuery = qs.stringify( Object.assign( {}, queryParams, newQueryParams ), {
			addQueryPrefix: true,
		} );
		const href = `${ url }${ nextDayQuery }`;
		this.handleArrowEvent( 'next', href );
	};

	queryParamsForPreviousDate = ( previousDay ) => {
		const { dateRange, moment, queryParams } = this.props;
		// Takes a 'YYYY-MM-DD' string.
		const newParams = { startDate: previousDay };
		// Maintain previous behaviour if we don't have a date range to work with.
		if ( dateRange === undefined ) {
			return newParams;
		}
		// Test if we need to update the chart start/end dates.
		const isBefore = moment( previousDay ).isBefore( moment( queryParams.chartStart ) );
		if ( isBefore ) {
			newParams.chartEnd = moment( queryParams.chartStart )
				.subtract( 1, 'days' )
				.format( 'YYYY-MM-DD' );
			newParams.chartStart = moment( queryParams.chartStart )
				.subtract( dateRange.daysInRange, 'days' )
				.format( 'YYYY-MM-DD' );
		}
		return newParams;
	};

	handleArrowPrevious = () => {
		const { date, moment, period, url, queryParams, isEmailStats, maxBars } = this.props;
		const numberOfDAys = this.getNumberOfDays( isEmailStats, period, maxBars );
		const usedPeriod = this.calculatePeriod( period );
		const previousDay = moment( date ).subtract( numberOfDAys, usedPeriod ).format( 'YYYY-MM-DD' );
		const newQueryParams = this.queryParamsForPreviousDate( previousDay );
		const previousDayQuery = qs.stringify( Object.assign( {}, queryParams, newQueryParams ), {
			addQueryPrefix: true,
		} );
		const href = `${ url }${ previousDayQuery }`;
		this.handleArrowEvent( 'previous', href );
	};

	// Copied from`client/my-sites/stats/stats-chart-tabs/index.jsx`
	onLegendClick = ( chartItem ) => {
		const activeLegend = this.props.activeLegend.slice();
		const chartIndex = activeLegend.indexOf( chartItem );
		let gaEventAction;
		if ( -1 === chartIndex ) {
			activeLegend.push( chartItem );
			gaEventAction = ' on';
		} else {
			activeLegend.splice( chartIndex );
			gaEventAction = ' off';
		}
		this.props.recordGoogleEvent(
			'Stats',
			`Toggled Nested Chart ${ chartItem } ${ gaEventAction }`
		);
		this.props.onChangeLegend( activeLegend );
	};

	render() {
		const {
			children,
			date,
			moment,
			period,
			showArrows,
			disablePreviousArrow,
			disableNextArrow,
			queryParams,
			slug,
			isWithNewDateControl,
			dateRange,
		} = this.props;

		const isToday = moment( date ).isSame( moment(), period );

		return (
			<div
				className={ classNames( 'stats-period-navigation', {
					'stats-period-navigation__is-with-new-date-control': isWithNewDateControl,
				} ) }
			>
				<div className="stats-period-navigation__children">{ children }</div>
				{ isWithNewDateControl ? (
					<div className="stats-period-navigation__date-control">
						<StatsDateControl slug={ slug } queryParams={ queryParams } dateRange={ dateRange } />
						<div className="stats-period-navigation__period-control">
							{ this.props.activeTab && (
								<Legend
									activeCharts={ this.props.activeLegend }
									activeTab={ this.props.activeTab }
									availableCharts={ this.props.availableLegend }
									clickHandler={ this.onLegendClick }
									tabs={ this.props.charts }
								/>
							) }
							{ showArrows && (
								<NavigationArrows
									disableNextArrow={ disableNextArrow || isToday }
									disablePreviousArrow={ disablePreviousArrow }
									onClickNext={ this.handleArrowNext }
									onClickPrevious={ this.handleArrowPrevious }
								/>
							) }
							<IntervalDropdown slug={ slug } period={ period } queryParams={ queryParams } />
						</div>
					</div>
				) : (
					<>
						{ showArrows && (
							<NavigationArrows
								disableNextArrow={ disableNextArrow || isToday }
								disablePreviousArrow={ disablePreviousArrow }
								onClickNext={ this.handleArrowNext }
								onClickPrevious={ this.handleArrowPrevious }
							/>
						) }
					</>
				) }
			</div>
		);
	}
}

const connectComponent = connect( null, { recordGoogleEvent: recordGoogleEventAction } );

export default flowRight(
	connectComponent,
	localize,
	withRtl,
	withLocalizedMoment
)( StatsPeriodNavigation );
