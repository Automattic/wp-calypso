/** @format */
/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import config from 'config';
import debugFactory from 'debug';
import scrollTo from 'lib/scroll-to';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { first, get, groupBy, includes, isEmpty, isNull, last, range } from 'lodash';

/**
 * Internal dependencies
 */
import ActivityLogBanner from '../activity-log-banner';
import ActivityLogConfirmDialog from '../activity-log-confirm-dialog';
import ActivityLogDay from '../activity-log-day';
import ActivityLogDayPlaceholder from '../activity-log-day/placeholder';
import ActivityLogRewindToggle from './activity-log-rewind-toggle';
import DatePicker from 'my-sites/stats/stats-date-picker';
import EmptyContent from 'components/empty-content';
import ErrorBanner from '../activity-log-banner/error-banner';
import JetpackColophon from 'components/jetpack-colophon';
import Main from 'components/main';
import ProgressBanner from '../activity-log-banner/progress-banner';
import QueryActivityLog from 'components/data/query-activity-log';
import QueryRewindStatus from 'components/data/query-rewind-status';
import QuerySiteSettings from 'components/data/query-site-settings'; // For site time offset
import SidebarNavigation from 'my-sites/sidebar-navigation';
import StatsFirstView from '../stats-first-view';
import StatsNavigation from 'blocks/stats-navigation';
import StatsPeriodNavigation from 'my-sites/stats/stats-period-navigation';
import SuccessBanner from '../activity-log-banner/success-banner';
import { adjustMoment, getActivityLogQuery, getStartMoment } from './utils';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug, getSiteTitle } from 'state/sites/selectors';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';
import {
	rewindRequestDismiss as rewindRequestDismissAction,
	rewindRequestRestore as rewindRequestRestoreAction,
	rewindRestore as rewindRestoreAction,
} from 'state/activity-log/actions';
import {
	canCurrentUser,
	getActivityLog,
	getActivityLogs,
	getRequestedRewind,
	getRestoreProgress,
	getRewindStatusError,
	getSiteGmtOffset,
	getSiteTimezoneValue,
	getRewindStartDate,
	isRewindActive as isRewindActiveSelector,
} from 'state/selectors';

/**
 * Module constants
 */
const debug = debugFactory( 'calypso:activity-log' );
const rewindEnabledByConfig = config.isEnabled( 'jetpack/activity-log/rewind' );

const flushEmptyDays = days => [
	days.length === 1 ? 'empty-day' : 'empty-range',
	[ first( days ), last( days ) ],
];

/**
 * Takes a list of [ day, eventList ] pairs and produces
 * a list of [ type, [ start, end ], eventList? ] triplets
 *
 * We have three ways to represent any given day with
 * Activity Log events:
 *
 *  - The day has events
 *  - The day has no events
 *  - The day has no events _and_
 *    neither did the previous day
 *
 * When "empty days" follow other empty days then we
 * want to group them into "empty ranges" so that we
 * don't end up showing a bunch of needless empty
 * day visual components on the page.
 *
 * Note: although this is recursive, since we don't
 *       expect to ever be descending more than than
 *       31 times (in the worst case because there are
 *       no months with more than 31 days) we don't
 *       need to guard against stack overflow here, it
 *       just won't recurse that deeply.
 *
 * Example input:
 * [ [ moment( '2017-10-08 14:48:01' ), [] ]
 * , [ moment( '2017-10-09 03:13:48' ), [ event1, event2, … ] ]
 * , [ moment( … ), [] ]
 * , [ moment( … ), [] ]
 * , [ moment( … ), [ event3 ] ]
 * ]
 *
 * Example output:
 * [ [ 'empty-day', [ moment( … ) ] ]
 * , [ 'non-empty-day', [ moment( … ) ], [ event1, event2, … ] ]
 * , [ 'empty-range', [ moment( … ), moment( … ) ] ]
 * , [ 'non-empty-day', [ moment( …) ], [ event3 ] ]
 * ]
 *
 * Note: the days coming into this function must be sorted.
 *       it doesn't matter in which direction, but they must
 *       be sequential one way or the other
 *
 * @param {Array} remainingDays remaining _sorted_ days to process
 * @param {Array} groups final output data structure (see comment above)
 * @param {Array} emptyDays running track of empty days to group
 * @returns {Array} grouped days and events
 */
const intoVisualGroups = ( remainingDays, groups = [], emptyDays = [] ) => {
	if ( ! remainingDays.length ) {
		return emptyDays.length ? [ ...groups, flushEmptyDays( emptyDays ) ] : groups;
	}

	const [ nextDay, ...nextRemaining ] = remainingDays;
	const [ day, events ] = nextDay;

	// without activity we track the day in order to group empty days
	if ( ! events.length ) {
		return intoVisualGroups( nextRemaining, groups, [ ...emptyDays, day ] );
	}

	// if we have activity but no previously-tracked empty days
	// then just push out this day onto the output
	if ( ! emptyDays.length ) {
		return intoVisualGroups(
			nextRemaining,
			[ ...groups, [ 'non-empty-day', [ day, day ], events ] ],
			[]
		);
	}

	// otherwise we want to flush out the tracked group into the output
	// push this day out as well
	// and restart without any tracked empty days
	if ( emptyDays.length ) {
		return intoVisualGroups(
			nextRemaining,
			[ ...groups, flushEmptyDays( emptyDays ), [ 'non-empty-day', [ day, day ], events ] ],
			[]
		);
	}
};

const daysInMonth = ( moment, startMoment, today ) => {
	const endOfMonth = startMoment
		.clone()
		.endOf( 'month' )
		.startOf( 'day' );
	const startOfMonth = startMoment.clone().startOf( 'month' );
	const startOfToday = today.clone().startOf( 'day' );
	const endOfStream = moment.min( endOfMonth, startOfToday );

	const asDayInMonth = n => startOfMonth.clone().add( n, 'day' );
	return range( endOfStream.date() ).map( asDayInMonth );
};

const logsByDay = ( moment, logs, startMoment, applyOffset ) => {
	const dayGroups = groupBy( logs, log =>
		applyOffset( moment.utc( log.activityTs ) )
			.endOf( 'day' )
			.valueOf()
	);

	return daysInMonth( moment, startMoment, applyOffset( moment.utc() ) ).map( day => [
		day,
		get(
			dayGroups,
			day
				.clone()
				.endOf( 'day' )
				.valueOf(),
			[]
		),
	] );
};

class ActivityLog extends Component {
	static propTypes = {
		restoreProgress: PropTypes.shape( {
			errorCode: PropTypes.string.isRequired,
			failureReason: PropTypes.string.isRequired,
			message: PropTypes.string.isRequired,
			percent: PropTypes.number.isRequired,
			restoreId: PropTypes.number,
			status: PropTypes.oneOf( [
				'finished',
				'queued',
				'running',

				// These are other VP restore statuses.
				// We should _never_ see them for Activity Log rewinds
				// 'aborted',
				// 'fail',
				// 'success',
				// 'success-with-errors',
			] ).isRequired,
			timestamp: PropTypes.number.isRequired,
		} ),
		recordTracksEvent: PropTypes.func.isRequired,
		requestedRestoreActivity: PropTypes.shape( {
			activityTs: PropTypes.number.isRequired,
		} ),
		requestedRestoreActivityId: PropTypes.string,
		rewindRequestDismiss: PropTypes.func.isRequired,
		rewindRequestRestore: PropTypes.func.isRequired,
		rewindRestore: PropTypes.func.isRequired,
		rewindStatusError: PropTypes.shape( {
			error: PropTypes.string.isRequired,
			message: PropTypes.string.isRequired,
		} ),
		siteId: PropTypes.number,
		siteTitle: PropTypes.string,
		slug: PropTypes.string,

		// FIXME: Testing only
		isPressable: PropTypes.bool,

		// localize
		moment: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	componentDidMount() {
		window.scrollTo( 0, 0 );
	}

	getStartMoment() {
		const { gmtOffset, startDate, timezone } = this.props;
		return getStartMoment( { gmtOffset, startDate, timezone } );
	}

	handlePeriodChange = ( { date, direction } ) => {
		this.props.recordTracksEvent( 'calypso_activitylog_monthpicker_change', {
			date: date.utc().toISOString(),
			direction,
		} );
	};

	handlePeriodChangeBottom = ( ...args ) => {
		scrollTo( {
			x: 0,
			y: 0,
			duration: 250,
		} );
		this.handlePeriodChange( ...args );
	};

	handleRequestRestore = ( activityId, from ) => {
		const { recordTracksEvent, rewindRequestRestore, siteId } = this.props;

		recordTracksEvent( 'calypso_activitylog_restore_request', { from } );
		rewindRequestRestore( siteId, activityId );
	};

	handleRestoreDialogClose = () => {
		const { recordTracksEvent, rewindRequestDismiss, siteId } = this.props;
		recordTracksEvent( 'calypso_activitylog_restore_cancel' );
		rewindRequestDismiss( siteId );
	};

	handleRestoreDialogConfirm = () => {
		const { recordTracksEvent, requestedRestoreActivity, rewindRestore, siteId } = this.props;
		const { rewindId } = requestedRestoreActivity;

		debug( 'Restore requested for after activity %o', requestedRestoreActivity );
		recordTracksEvent( 'calypso_activitylog_restore_confirm', { rewindId } );
		rewindRestore( siteId, rewindId );
	};

	/**
	 * Adjust a moment by the site timezone or gmt offset. Use the resulting function wherever log
	 * times need to be formatted for display to ensure all times are displayed as site times.
	 *
	 * @param   {object} moment Moment to adjust.
	 * @returns {object}        Moment adjusted for site timezone or gmtOffset.
	 */
	applySiteOffset = moment => {
		const { timezone, gmtOffset } = this.props;
		return adjustMoment( { timezone, gmtOffset, moment } );
	};

	isRestoreInProgress() {
		return includes( [ 'queued', 'running' ], get( this.props, [ 'restoreProgress', 'status' ] ) );
	}

	renderBanner() {
		const { restoreProgress, siteId } = this.props;

		if ( ! restoreProgress ) {
			return null;
		}
		const {
			errorCode,
			failureReason,
			freshness,
			percent,
			restoreId,
			siteTitle,
			status,
			timestamp,
		} = restoreProgress;

		if ( status === 'finished' ) {
			return (
				<div>
					<QueryActivityLog siteId={ siteId } />
					{ errorCode ? (
						<ErrorBanner
							errorCode={ errorCode }
							failureReason={ failureReason }
							requestRestore={ this.handleRequestRestore }
							siteId={ siteId }
							siteTitle={ siteTitle }
							timestamp={ timestamp }
						/>
					) : (
						<SuccessBanner
							applySiteOffset={ this.applySiteOffset }
							siteId={ siteId }
							timestamp={ timestamp }
						/>
					) }
				</div>
			);
		}
		return (
			<ProgressBanner
				applySiteOffset={ this.applySiteOffset }
				freshness={ freshness }
				percent={ percent }
				restoreId={ restoreId }
				siteId={ siteId }
				status={ status }
				timestamp={ timestamp }
			/>
		);
	}

	renderErrorMessage() {
		if ( ! rewindEnabledByConfig ) {
			return null;
		}

		const { isPressable, rewindStatusError, translate } = this.props;

		// Do not match null
		// FIXME: This is for internal testing
		if ( false === isPressable ) {
			return (
				<ActivityLogBanner status="info" icon={ null }>
					{ translate( 'Rewind is currently only available for Pressable sites' ) }
				</ActivityLogBanner>
			);
		}

		if ( rewindStatusError ) {
			return (
				<ActivityLogBanner status="error" icon={ null }>
					{ translate( 'Rewind error: %s', { args: rewindStatusError.message } ) }
					<br />
					{ translate( 'Do you have an appropriate plan?' ) }
				</ActivityLogBanner>
			);
		}
	}

	renderMonthNavigation( position ) {
		const { logs, slug } = this.props;
		const startOfMonth = this.getStartMoment().startOf( 'month' );
		const query = {
			period: 'month',
			date: startOfMonth.format( 'YYYY-MM-DD' ),
		};

		if ( position === 'bottom' && ( ! isNull( logs ) && isEmpty( logs ) ) ) {
			return null;
		}

		return (
			<StatsPeriodNavigation
				date={ startOfMonth }
				onPeriodChange={
					position === 'bottom' ? this.handlePeriodChangeBottom : this.handlePeriodChange
				}
				period="month"
				url={ `/stats/activity/${ slug }` }
			>
				<DatePicker isActivity={ true } period="month" date={ startOfMonth } query={ query } />
			</StatsPeriodNavigation>
		);
	}

	render() {
		const {
			canViewActivityLog,
			gmtOffset,
			isPressable,
			isRewindActive,
			logs,
			moment,
			requestedRestoreActivity,
			requestedRestoreActivityId,
			siteId,
			slug,
			startDate,
			timezone,
			translate,
			rewindStartDate,
		} = this.props;
		const hasFirstBackup = ! isEmpty( rewindStartDate );

		if ( false === canViewActivityLog ) {
			return (
				<Main>
					<SidebarNavigation />
					<EmptyContent
						title={ translate( 'You are not authorized to view this page' ) }
						illustration={ '/calypso/images/illustrations/illustration-404.svg' }
					/>
				</Main>
			);
		}

		const disableRestore = this.isRestoreInProgress();

		const rewindConfirmDialog = requestedRestoreActivity && (
			<ActivityLogConfirmDialog
				applySiteOffset={ this.applySiteOffset }
				key="activity-rewind-dialog"
				onClose={ this.handleRestoreDialogClose }
				onConfirm={ this.handleRestoreDialogConfirm }
				timestamp={ requestedRestoreActivity.activityTs }
			/>
		);

		const visualGroups = intoVisualGroups(
			logsByDay( moment, logs, this.getStartMoment(), this.applySiteOffset )
		);
		const today = moment()
			.utc()
			.startOf( 'day' );

		return (
			<Main wideLayout>
				{ rewindEnabledByConfig && <QueryRewindStatus siteId={ siteId } /> }
				<QueryActivityLog
					siteId={ siteId }
					{ ...getActivityLogQuery( { gmtOffset, startDate, timezone } ) }
				/>
				<QuerySiteSettings siteId={ siteId } />
				<StatsFirstView />
				<SidebarNavigation />
				<StatsNavigation selectedItem={ 'activity' } siteId={ siteId } slug={ slug } />
				{ this.renderErrorMessage() }
				{ hasFirstBackup && this.renderMonthNavigation() }
				{ this.renderBanner() }
				{ ! isRewindActive && !! isPressable && <ActivityLogRewindToggle siteId={ siteId } /> }
				{ isNull( logs ) && (
					<section className="activity-log__wrapper">
						<ActivityLogDayPlaceholder />
						<ActivityLogDayPlaceholder />
						<ActivityLogDayPlaceholder />
					</section>
				) }
				{ ! isNull( logs ) &&
				isEmpty( logs ) && (
					<EmptyContent
						title={ translate( 'No activity for %s', {
							args: this.getStartMoment().format( 'MMMM YYYY' ),
						} ) }
					/>
				) }
				{ ! isEmpty( logs ) && (
					<section className="activity-log__wrapper">
						{ visualGroups
							.slice()
							.reverse() // show with newest event on top
							.map( ( [ type, [ start, end ], events ] ) => {
								const isToday = today.isSame(
									end
										.clone()
										.utc()
										.startOf( 'day' )
								);

								switch ( type ) {
									case 'empty-day':
										return (
											<div key={ start.format() } className="activity-log__empty-day">
												<div className="activity-log__empty-day-title">
													{ start.format( 'LL' ) }
													{ isToday && ` \u2014 ${ translate( 'Today' ) }` }
												</div>
												<div className="activity-log__empty-day-events">
													{ translate( 'No activity' ) }
												</div>
											</div>
										);

									case 'empty-range':
										return (
											<div key={ start.format( 'LL' ) } className="activity-log__empty-day">
												<div className="activity-log__empty-day-title">
													{ `${ start.format( 'LL' ) } - ${ end.format( 'LL' ) }` }
													{ isToday && ` \u2014 ${ translate( 'Today' ) }` }
												</div>
												<div className="activity-log__empty-day-events">
													{ translate( 'No activity' ) }
												</div>
											</div>
										);

									case 'non-empty-day':
										return (
											<ActivityLogDay
												key={ start.format() }
												applySiteOffset={ this.applySiteOffset }
												requestedRestoreActivityId={ requestedRestoreActivityId }
												rewindConfirmDialog={ rewindConfirmDialog }
												disableRestore={ disableRestore }
												hideRestore={ ! rewindEnabledByConfig || ! isPressable }
												isRewindActive={ isRewindActive }
												logs={ events }
												requestRestore={ this.handleRequestRestore }
												siteId={ siteId }
												tsEndOfSiteDay={ start.valueOf() }
											/>
										);
								}
							} ) }
					</section>
				) }
				{ hasFirstBackup && this.renderMonthNavigation( 'bottom' ) }
				<JetpackColophon />
			</Main>
		);
	}
}

export default connect(
	( state, { startDate } ) => {
		const siteId = getSelectedSiteId( state );
		const gmtOffset = getSiteGmtOffset( state, siteId );
		const timezone = getSiteTimezoneValue( state, siteId );
		const requestedRestoreActivityId = getRequestedRewind( state, siteId );

		return {
			canViewActivityLog: canCurrentUser( state, siteId, 'manage_options' ),
			gmtOffset,
			isRewindActive: isRewindActiveSelector( state, siteId ),
			logs: getActivityLogs(
				state,
				siteId,
				getActivityLogQuery( { gmtOffset, startDate, timezone } )
			),
			requestedRestoreActivity: getActivityLog( state, siteId, requestedRestoreActivityId ),
			requestedRestoreActivityId,
			restoreProgress: getRestoreProgress( state, siteId ),
			rewindStatusError: getRewindStatusError( state, siteId ),
			rewindStartDate: getRewindStartDate( state, siteId ),
			siteId,
			siteTitle: getSiteTitle( state, siteId ),
			slug: getSiteSlug( state, siteId ),
			timezone,

			// FIXME: Testing only
			isPressable: get( state.activityLog.rewindStatus, [ siteId, 'isPressable' ], null ),
		};
	},
	{
		recordTracksEvent: recordTracksEventAction,
		rewindRequestDismiss: rewindRequestDismissAction,
		rewindRequestRestore: rewindRequestRestoreAction,
		rewindRestore: rewindRestoreAction,
	}
)( localize( ActivityLog ) );
