import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import clsx from 'clsx';
import { localize, withRtl } from 'i18n-calypso';
import { flowRight } from 'lodash';
import PropTypes from 'prop-types';
import qs from 'qs';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { getShortcuts } from 'calypso/components/date-range/use-shortcuts';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import StatsDateControl from 'calypso/components/stats-date-control';
import {
	STATS_FEATURE_DATE_CONTROL,
	STATS_FEATURE_INTERVAL_DROPDOWN,
} from 'calypso/my-sites/stats/constants';
import { recordGoogleEvent as recordGoogleEventAction } from 'calypso/state/analytics/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { toggleUpsellModal } from 'calypso/state/stats/paid-stats-upsell/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getMomentSiteZone } from '../hooks/use-moment-site-zone';
import { shouldGateStats } from '../hooks/use-should-gate-stats';
import { withStatsPurchases } from '../hooks/use-stats-purchases';
import NavigationArrows from '../navigation-arrows';
import StatsCardUpsell from '../stats-card-upsell';
import { getPathWithUpdatedQueryString } from '../utils';

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

	handleArrowPrevious = () => {
		const { date, moment, period, url, queryParams, isEmailStats, maxBars } = this.props;
		const numberOfDAys = this.getNumberOfDays( isEmailStats, period, maxBars );
		const usedPeriod = this.calculatePeriod( period );
		const previousDay = moment( date ).subtract( numberOfDAys, usedPeriod ).format( 'YYYY-MM-DD' );
		const newQueryParams = this.queryParamsForPreviousDate( previousDay );
		const previousDayQuery = qs.stringify( Object.assign( {}, queryParams, newQueryParams ), {
			addQueryPrefix: true,
		} );

		let href = null;
		if ( url ) {
			href = `${ url }${ previousDayQuery }`;
		}

		this.handleArrowEvent( 'previous', href );
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

		let href = null;
		if ( url ) {
			href = `${ url }${ nextDayQuery }`;
		}

		this.handleArrowEvent( 'next', href );
	};

	handlePreviousDateRangeNavigation = () => {
		this.handleArrowNavigation( true );
	};

	handleNextRangeDateNavigation = () => {
		this.handleArrowNavigation( false );
	};

	handleArrowNavigation = ( previousOrNext = false ) => {
		const { moment, period, slug, dateRange } = this.props;

		const navigationStart = moment( dateRange.chartStart );
		const navigationEnd = moment( dateRange.chartEnd );

		if ( previousOrNext ) {
			// Navigate to the previous date range.
			navigationStart.subtract( dateRange.daysInRange, 'days' );
			navigationEnd.subtract( dateRange.daysInRange, 'days' );
		} else {
			// Navigate to the next date range.
			navigationStart.add( dateRange.daysInRange, 'days' );
			navigationEnd.add( dateRange.daysInRange, 'days' );
		}

		const chartStart = navigationStart.format( 'YYYY-MM-DD' );
		const chartEnd = navigationEnd.format( 'YYYY-MM-DD' );

		const path = `/stats/${ period }/${ slug }`;
		const url = getPathWithUpdatedQueryString( { chartStart, chartEnd }, path );

		page( url );
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
			dateRange,
			shortcutList,
			gateDateControl,
			siteId,
			momentSiteZone,
		} = this.props;

		const isToday = moment( date ).isSame( momentSiteZone, period );

		const isChartRangeEndSameOrAfterToday = moment( dateRange?.chartEnd ).isSameOrAfter(
			momentSiteZone,
			'day'
		);
		const showArrowsForDateRange = showArrows && dateRange?.daysInRange <= 31;

		return (
			<div
				className={ clsx( 'stats-period-navigation', {
					'stats-period-navigation__is-with-new-date-control': isWithNewDateControl,
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
				{ isWithNewDateControl && (
					<div className="stats-period-navigation__date-range-control">
						{ showArrowsForDateRange && (
							<NavigationArrows
								disableNextArrow={ disableNextArrow || isChartRangeEndSameOrAfterToday }
								disablePreviousArrow={ disablePreviousArrow }
								onClickNext={ this.handleNextRangeDateNavigation }
								onClickPrevious={ this.handlePreviousDateRangeNavigation }
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
			</div>
		);
	}
}

const addIsGatedFor = ( state, siteId ) => ( shortcut ) => ( {
	...shortcut,
	isGated: shouldGateStats( state, siteId, `${ STATS_FEATURE_DATE_CONTROL }/${ shortcut.id }` ),
	statType: `${ STATS_FEATURE_DATE_CONTROL }/${ shortcut.id }`,
} );

const connectComponent = connect(
	( state, { period, translate } ) => {
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

		const { supportedShortcutList } = getShortcuts( state, {}, translate );
		const shortcutList = supportedShortcutList.map( addIsGatedFor( state, siteId ) );

		return {
			shortcutList,
			gateDateControl,
			gatePeriodInterval,
			siteId,
			isSiteJetpackNotAtomic,
			momentSiteZone: getMomentSiteZone( state, siteId ),
		};
	},
	{ recordGoogleEvent: recordGoogleEventAction, toggleUpsellModal }
);

export default flowRight(
	localize,
	connectComponent,
	withRtl,
	withLocalizedMoment,
	withStatsPurchases
)( StatsPeriodNavigation );
