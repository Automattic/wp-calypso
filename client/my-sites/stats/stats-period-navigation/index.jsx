import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import clsx from 'clsx';
import { localize, translate, withRtl } from 'i18n-calypso';
import { flowRight } from 'lodash';
import PropTypes from 'prop-types';
import qs from 'qs';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import Legend from 'calypso/components/chart/legend';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import StatsDateControl from 'calypso/components/stats-date-control';
import IntervalDropdown from 'calypso/components/stats-interval-dropdown';
import {
	STATS_FEATURE_DATE_CONTROL,
	STATS_FEATURE_DATE_CONTROL_LAST_7_DAYS,
	STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS,
	STATS_FEATURE_DATE_CONTROL_LAST_90_DAYS,
	STATS_FEATURE_DATE_CONTROL_LAST_YEAR,
	STATS_FEATURE_INTERVAL_DROPDOWN,
	STATS_FEATURE_INTERVAL_DROPDOWN_DAY,
	STATS_FEATURE_INTERVAL_DROPDOWN_MONTH,
	STATS_FEATURE_INTERVAL_DROPDOWN_WEEK,
	STATS_FEATURE_INTERVAL_DROPDOWN_YEAR,
	STATS_PERIOD,
} from 'calypso/my-sites/stats/constants';
import { recordGoogleEvent as recordGoogleEventAction } from 'calypso/state/analytics/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { toggleUpsellModal } from 'calypso/state/stats/paid-stats-upsell/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { shouldGateStats } from '../hooks/use-should-gate-stats';
import { withStatsPurchases } from '../hooks/use-stats-purchases';
import NavigationArrows from '../navigation-arrows';
import StatsCardUpsell from '../stats-card-upsell';

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
		isWithNewDateFiltering: PropTypes.bool,
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
		isWithNewDateFiltering: false,
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
		const { dateRange, moment } = this.props;
		// Takes a 'YYYY-MM-DD' string.
		const newParams = { startDate: nextDay };
		// Maintain previous behaviour if we don't have a date range to work with.
		if ( dateRange === undefined ) {
			return newParams;
		}
		// Test if we need to update the chart start/end dates.
		const isAfter = moment( nextDay ).isAfter( moment( dateRange.chartEnd ) );
		if ( isAfter ) {
			newParams.chartStart = moment( dateRange.chartEnd ).add( 1, 'days' ).format( 'YYYY-MM-DD' );
			newParams.chartEnd = moment( dateRange.chartEnd )
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
		const { dateRange, moment } = this.props;
		// Takes a 'YYYY-MM-DD' string.
		const newParams = { startDate: previousDay };
		// Maintain previous behaviour if we don't have a date range to work with.
		if ( dateRange === undefined ) {
			return newParams;
		}
		// Test if we need to update the chart start/end dates.
		const isBefore = moment( previousDay ).isBefore( moment( dateRange.chartStart ) );
		if ( isBefore ) {
			newParams.chartEnd = moment( dateRange.chartStart )
				.subtract( 1, 'days' )
				.format( 'YYYY-MM-DD' );
			newParams.chartStart = moment( dateRange.chartStart )
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

	onGatedHandler = ( events, source, statType ) => {
		// Stop the popup from showing for Jetpack sites.
		if ( this.props.isSiteJetpackNotAtomic ) {
			return;
		}

		events.forEach( ( event ) => recordTracksEvent( event.name, event.params ) );
		this.props.toggleUpsellModal( this.props.siteId, statType );
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
			isWithNewDateFiltering,
			dateRange,
			shortcutList,
			gateDateControl,
			intervals,
			siteId,
		} = this.props;

		const isToday = moment( date ).isSame( moment(), period );

		return (
			<div
				className={ clsx( 'stats-period-navigation', {
					'stats-period-navigation__is-with-new-date-control': isWithNewDateControl,
					'stats-period-navigation__is-with-new-date-filtering': isWithNewDateFiltering,
				} ) }
			>
				<div className="stats-period-navigation__children">{ children }</div>

				{ /* Legacy view: Show only navigation arrows when not using new date control */ }
				{ ! isWithNewDateControl && showArrows && (
					<NavigationArrows
						disableNextArrow={ disableNextArrow || isToday }
						disablePreviousArrow={ disablePreviousArrow }
						onClickNext={ this.handleArrowNext }
						onClickPrevious={ this.handleArrowPrevious }
					/>
				) }

				{ /* New filtering view: Shows date control in a simplified layout */ }
				{ isWithNewDateControl && isWithNewDateFiltering && (
					<div className="stats-period-navigation__date-range-control">
						{ showArrows && (
							<NavigationArrows
								disableNextArrow={ disableNextArrow || isToday }
								disablePreviousArrow={ disablePreviousArrow }
								onClickNext={ this.handleArrowNext }
								onClickPrevious={ this.handleArrowPrevious }
							/>
						) }
						<div className="stats-period-navigation__date-control">
							<StatsDateControl
								slug={ slug }
								queryParams={ queryParams }
								dateRange={ dateRange }
								shortcutList={ shortcutList }
								onGatedHandler={ this.onGatedHandler }
								overlay={
									gateDateControl && (
										<StatsCardUpsell
											className="stats-module__upsell"
											statType={ STATS_FEATURE_DATE_CONTROL }
											siteId={ siteId }
										/>
									)
								}
							/>
						</div>
					</div>
				) }

				{ /* Standard new date control view: Shows date control with additional controls (Legend, IntervalDropdown) */ }
				{ isWithNewDateControl && ! isWithNewDateFiltering && (
					<div className="stats-period-navigation__date-control">
						<StatsDateControl
							slug={ slug }
							queryParams={ queryParams }
							dateRange={ dateRange }
							shortcutList={ shortcutList }
							onGatedHandler={ this.onGatedHandler }
							overlay={
								gateDateControl && (
									<StatsCardUpsell
										className="stats-module__upsell"
										statType={ STATS_FEATURE_DATE_CONTROL }
										siteId={ siteId }
									/>
								)
							}
						/>
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
							<IntervalDropdown
								slug={ slug }
								period={ period }
								queryParams={ queryParams }
								intervals={ intervals }
								onGatedHandler={ this.onGatedHandler }
							/>
						</div>
					</div>
				) }
			</div>
		);
	}
}

const connectComponent = connect(
	( state, { period, isWithNewDateFiltering } ) => {
		const siteId = getSelectedSiteId( state );
		const gateDateControl = shouldGateStats( state, siteId, STATS_FEATURE_DATE_CONTROL );
		const gatePeriodInterval = shouldGateStats(
			state,
			siteId,
			`${ STATS_FEATURE_INTERVAL_DROPDOWN }/${ period }`
		);
		const isSiteJetpackNotAtomic = isJetpackSite( state, siteId, {
			treatAtomicAsJetpackSite: false,
		} );
		const shortcutList = [
			{
				id: 'last_7_days',
				label: translate( 'Last 7 Days' ),
				offset: 0,
				range: 6,
				period: STATS_PERIOD.DAY,
				isGated: shouldGateStats( state, siteId, STATS_FEATURE_DATE_CONTROL_LAST_7_DAYS ),
				statType: STATS_FEATURE_DATE_CONTROL_LAST_7_DAYS,
			},
			{
				id: 'last_30_days',
				label: translate( 'Last 30 Days' ),
				offset: 0,
				range: 29,
				period: STATS_PERIOD.DAY,
				isGated: shouldGateStats( state, siteId, STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS ),
				statType: STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS,
			},
			{
				id: 'last_3_months',
				label: translate( 'Last 90 Days' ),
				offset: 0,
				range: 89,
				period: STATS_PERIOD.WEEK,
				isGated: shouldGateStats( state, siteId, STATS_FEATURE_DATE_CONTROL_LAST_90_DAYS ),
				statType: STATS_FEATURE_DATE_CONTROL_LAST_90_DAYS,
			},
			{
				id: 'last_year',
				label: translate( 'Last Year' ),
				offset: 0,
				range: 364, // ranges are zero based!
				period: STATS_PERIOD.MONTH,
				isGated: shouldGateStats( state, siteId, STATS_FEATURE_DATE_CONTROL_LAST_YEAR ),
				statType: STATS_FEATURE_DATE_CONTROL_LAST_YEAR,
			},
		];
		if ( isWithNewDateFiltering ) {
			shortcutList.unshift(
				{
					id: 'today',
					label: translate( 'Today' ),
					offset: 0,
					range: 0,
					period: STATS_PERIOD.DAY,
				},
				{
					id: 'yesterday',
					label: translate( 'Yesterday' ),
					offset: 1,
					range: 0,
					period: STATS_PERIOD.DAY,
				}
			);
		}
		const intervals = {
			[ STATS_PERIOD.DAY ]: {
				id: STATS_PERIOD.DAY,
				label: translate( 'Days' ),
				isGated: shouldGateStats( state, siteId, STATS_FEATURE_INTERVAL_DROPDOWN_DAY ),
				statType: STATS_FEATURE_INTERVAL_DROPDOWN_DAY,
			},
			[ STATS_PERIOD.WEEK ]: {
				id: STATS_PERIOD.WEEK,
				label: translate( 'Weeks' ),
				isGated: shouldGateStats( state, siteId, STATS_FEATURE_INTERVAL_DROPDOWN_WEEK ),
				statType: STATS_FEATURE_INTERVAL_DROPDOWN_WEEK,
			},
			[ STATS_PERIOD.MONTH ]: {
				id: STATS_PERIOD.MONTH,
				label: translate( 'Months' ),
				isGated: shouldGateStats( state, siteId, STATS_FEATURE_INTERVAL_DROPDOWN_MONTH ),
				statType: STATS_FEATURE_INTERVAL_DROPDOWN_MONTH,
			},
			[ STATS_PERIOD.YEAR ]: {
				id: STATS_PERIOD.YEAR,
				label: translate( 'Years' ),
				isGated: shouldGateStats( state, siteId, STATS_FEATURE_INTERVAL_DROPDOWN_YEAR ),
				statType: STATS_FEATURE_INTERVAL_DROPDOWN_YEAR,
			},
		};

		return {
			shortcutList,
			gateDateControl,
			gatePeriodInterval,
			intervals,
			siteId,
			isSiteJetpackNotAtomic,
		};
	},
	{ recordGoogleEvent: recordGoogleEventAction, toggleUpsellModal }
);

export default flowRight(
	connectComponent,
	localize,
	withRtl,
	withLocalizedMoment,
	withStatsPurchases
)( StatsPeriodNavigation );
