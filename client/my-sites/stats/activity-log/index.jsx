/** @format */
/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import scrollTo from 'lib/scroll-to';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { first, get, groupBy, includes, isEmpty, isNull, last, range, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import ActivityLogBanner from 'my-sites/stats/activity-log-banner';
import ActivityLogDay from '../activity-log-day';
import ActivityLogDayPlaceholder from '../activity-log-day/placeholder';
import ActivityLogSwitch from '../activity-log-switch';
import ActivityLogUpgradeNotice from '../activity-log-upgrade-notice';
import Banner from 'components/banner';
import DatePicker from 'my-sites/stats/stats-date-picker';
import EmptyContent from 'components/empty-content';
import ErrorBanner from '../activity-log-banner/error-banner';
import JetpackColophon from 'components/jetpack-colophon';
import Main from 'components/main';
import ProgressBanner from '../activity-log-banner/progress-banner';
import QueryActivityLog from 'components/data/query-activity-log';
import QueryRewindState from 'components/data/query-rewind-state';
import QuerySiteSettings from 'components/data/query-site-settings'; // For site time offset
import QueryRewindBackupStatus from 'components/data/query-rewind-backup-status';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import StatsNavigation from 'blocks/stats-navigation';
import StatsPeriodNavigation from 'my-sites/stats/stats-period-navigation';
import SuccessBanner from '../activity-log-banner/success-banner';
import UnavailabilityNotice from './unavailability-notice';
import { adjustMoment, getActivityLogQuery, getStartMoment } from './utils';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug, getSiteTitle } from 'state/sites/selectors';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import {
	activityLogRequest,
	rewindRequestDismiss,
	rewindRestore,
	rewindBackupDismiss,
	rewindBackup,
} from 'state/activity-log/actions';
import {
	canCurrentUser,
	getActivityLog,
	getActivityLogs,
	getBackupProgress,
	getRequest,
	getRequestedBackup,
	getRequestedRewind,
	getRestoreProgress,
	getRewindState,
	getSiteGmtOffset,
	getSiteTimezoneValue,
	getOldestItemTs,
} from 'state/selectors';

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
const visualGroups = ( remainingDays, groups = [], emptyDays = [] ) => {
	if ( ! remainingDays.length ) {
		return emptyDays.length ? [ ...groups, flushEmptyDays( emptyDays ) ] : groups;
	}

	const [ nextDay, ...nextRemaining ] = remainingDays;
	const [ day, events ] = nextDay;

	// without activity we track the day in order to group empty days
	if ( ! events.length ) {
		return visualGroups( nextRemaining, groups, [ ...emptyDays, day ] );
	}

	// if we have activity but no previously-tracked empty days
	// then just push out this day onto the output
	if ( ! emptyDays.length ) {
		return visualGroups(
			nextRemaining,
			[ ...groups, [ 'non-empty-day', [ day, day ], events ] ],
			[]
		);
	}

	// otherwise we want to flush out the tracked group into the output
	// push this day out as well
	// and restart without any tracked empty days
	if ( emptyDays.length ) {
		return visualGroups(
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
	const dayGroups = groupBy( sortBy( logs, [ 'activityDate', 'activityTs' ] ).reverse(), log =>
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

// helper to separate out recursive part of algorithm
const intoVisualGroups = ( ...args ) => visualGroups( logsByDay( ...args ) ).reverse();

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
			rewindId: PropTypes.string.isRequired,
		} ),
		backupProgress: PropTypes.object,
		changePeriod: PropTypes.func,
		requestedRestore: PropTypes.shape( {
			rewindId: PropTypes.string.isRequired,
			activityTs: PropTypes.number.isRequired,
		} ),
		requestedRestoreId: PropTypes.string,
		rewindRequestDismiss: PropTypes.func.isRequired,
		rewindRestore: PropTypes.func.isRequired,
		createBackup: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		siteTitle: PropTypes.string,
		slug: PropTypes.string,

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

	handlePeriodChangeBottom = ( ...args ) => {
		scrollTo( {
			x: 0,
			y: 0,
			duration: 250,
		} );
		this.props.changePeriod( ...args );
	};

	/**
	 * Close Restore, Backup, or Transfer confirmation dialog.
	 * @param {string} type Type of dialog to close.
	 */
	handleCloseDialog = type => {
		const { siteId } = this.props;
		switch ( type ) {
			case 'restore':
				this.props.rewindRequestDismiss( siteId );
				break;
			case 'backup':
				this.props.dismissBackup( siteId );
				break;
		}
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

	/**
	 * Render a card showing the progress of a restore.
	 *
	 * @returns {object} Component showing progress.
	 */
	renderActionProgress() {
		const { siteId, restoreProgress, backupProgress } = this.props;

		if ( ! restoreProgress && ! backupProgress ) {
			return null;
		}

		const cards = [];

		if ( !! restoreProgress ) {
			cards.push(
				'finished' === restoreProgress.status
					? this.getEndBanner( siteId, restoreProgress )
					: this.getProgressBanner( siteId, restoreProgress, 'restore' )
			);
		}

		if ( !! backupProgress ) {
			if ( 0 <= backupProgress.progress ) {
				cards.push( this.getProgressBanner( siteId, backupProgress, 'backup' ) );
			} else if (
				! isEmpty( backupProgress.url ) &&
				Date.now() < Date.parse( backupProgress.validUntil )
			) {
				cards.push( this.getEndBanner( siteId, backupProgress ) );
			} else if ( ! isEmpty( backupProgress.backupError ) ) {
				cards.push( this.getEndBanner( siteId, backupProgress ) );
			}
		}

		return cards;
	}

	/**
	 * Display the status of the operation currently being performed.
	 * @param   {integer} siteId         Id of the site where the operation is performed.
	 * @param   {object}  actionProgress Current status of operation performed.
	 * @param   {string}  action         Action type. Allows to set the right text without waiting for data.
	 * @returns {object}                 Card showing progress.
	 */
	getProgressBanner( siteId, actionProgress, action ) {
		const {
			percent,
			progress,
			restoreId,
			downloadId,
			status,
			timestamp,
			rewindId,
		} = actionProgress;
		return (
			<ProgressBanner
				key={ `progress-${ restoreId || downloadId }` }
				applySiteOffset={ this.applySiteOffset }
				percent={ percent || progress }
				restoreId={ restoreId }
				downloadId={ downloadId }
				siteId={ siteId }
				status={ status }
				timestamp={ timestamp || rewindId }
				action={ action }
			/>
		);
	}

	/**
	 * Display a success or error card based on the last status of operation.
	 * @param   {integer} siteId   Id of the site where the operation was performed.
	 * @param   {object}  progress Last status of operation.
	 * @returns {object}           Card showing success or error.
	 */
	getEndBanner( siteId, progress ) {
		const {
			errorCode,
			backupError,
			failureReason,
			siteTitle,
			timestamp,
			url,
			downloadCount,
			restoreId,
			downloadId,
			rewindId,
		} = progress;
		const requestedRestoreId = this.props.requestedRestoreId || rewindId;
		return (
			<div key={ `end-banner-${ restoreId || downloadId }` }>
				<QueryActivityLog siteId={ siteId } />
				{ errorCode || backupError ? (
					<ErrorBanner
						key={ `error-${ restoreId || downloadId }` }
						errorCode={ errorCode || backupError }
						downloadId={ downloadId }
						requestedRestoreId={ requestedRestoreId }
						failureReason={ failureReason }
						createBackup={ this.props.createBackup }
						rewindRestore={ this.props.rewindRestore }
						closeDialog={ this.handleCloseDialog }
						siteId={ siteId }
						siteTitle={ siteTitle }
						timestamp={ timestamp }
					/>
				) : (
					<SuccessBanner
						key={ `success-${ restoreId || downloadId }` }
						applySiteOffset={ this.applySiteOffset }
						siteId={ siteId }
						timestamp={ rewindId }
						downloadId={ downloadId }
						backupUrl={ url }
						downloadCount={ downloadCount }
					/>
				) }
			</div>
		);
	}

	renderErrorMessage() {
		const { rewindState, translate } = this.props;

		if ( ! rewindState.rewind || rewindState.rewind.status !== 'failed' ) {
			return null;
		}

		return (
			<ActivityLogBanner status="error" icon={ null }>
				{ translate( 'Something happened and we were unable to restore your site.' ) }
				<br />
				{ translate( 'Please try again or contact support.' ) }
			</ActivityLogBanner>
		);
	}

	renderMonthNavigation( position ) {
		const { logs } = this.props;

		if ( position === 'bottom' && ( ! isNull( logs ) && isEmpty( logs ) ) ) {
			return null;
		}

		const { slug, changePeriod, oldestItemTs } = this.props;
		const startOfMonth = this.getStartMoment().startOf( 'month' );
		const monthStartTs = startOfMonth.clone().valueOf();
		const query = {
			period: 'month',
			date: startOfMonth.format( 'YYYY-MM-DD' ),
		};

		return (
			<StatsPeriodNavigation
				date={ startOfMonth }
				onPeriodChange={ position === 'bottom' ? this.handlePeriodChangeBottom : changePeriod }
				period="month"
				url={ `/stats/activity/${ slug }` }
				hidePreviousArrow={ monthStartTs <= oldestItemTs }
			>
				<DatePicker isActivity={ true } period="month" date={ startOfMonth } query={ query } />
			</StatsPeriodNavigation>
		);
	}

	getActivityLog() {
		const {
			logRequestQuery,
			logs,
			moment,
			requestData,
			rewindState,
			siteId,
			slug,
			translate,
		} = this.props;

		const disableRestore =
			includes( [ 'queued', 'running' ], get( this.props, [ 'restoreProgress', 'status' ] ) ) ||
			'active' !== rewindState.state;
		const disableBackup = 0 <= get( this.props, [ 'backupProgress', 'progress' ], -Infinity );

		const today = moment()
			.utc()
			.startOf( 'day' );

		// Content shown when there are no logs.
		// The network request either finished with no events or is still ongoing.
		const noLogsContent = requestData.logs.hasLoaded ? (
			<EmptyContent
				title={ translate( 'No activity for %s', {
					args: this.getStartMoment().format( 'MMMM YYYY' ),
				} ) }
			/>
		) : (
			<section className="activity-log__wrapper">
				<ActivityLogDayPlaceholder />
				<ActivityLogDayPlaceholder />
				<ActivityLogDayPlaceholder />
			</section>
		);

		return (
			<div>
				<QueryActivityLog siteId={ siteId } { ...logRequestQuery } />
				{ siteId &&
					'active' === rewindState.state && <QueryRewindBackupStatus siteId={ siteId } /> }
				<QuerySiteSettings siteId={ siteId } />
				<SidebarNavigation />
				<StatsNavigation selectedItem={ 'activity' } siteId={ siteId } slug={ slug } />
				{ siteId && <ActivityLogUpgradeNotice siteId={ siteId } /> }
				{ siteId &&
					'unavailable' === rewindState.state && <UnavailabilityNotice siteId={ siteId } /> }
				{ 'awaitingCredentials' === rewindState.state && (
					<Banner
						icon="history"
						href={
							rewindState.canAutoconfigure
								? `/start/rewind-auto-config/?blogid=${ siteId }&siteSlug=${ slug }`
								: `/start/rewind-setup/?siteId=${ siteId }&siteSlug=${ slug }`
						}
						title={ translate( 'Add site credentials' ) }
						description={ translate(
							'Backups and security scans require access to your site to work properly.'
						) }
					/>
				) }
				{ 'provisioning' === rewindState.state && (
					<Banner
						icon="history"
						disableHref
						title={ translate( 'Your backup is underway' ) }
						description={ translate(
							"We're currently backing up your site for the first time, and we'll let you know when we're finished. " +
								"After this initial backup, we'll save future changes in real time."
						) }
					/>
				) }
				{ this.renderErrorMessage() }
				{ this.renderMonthNavigation() }
				{ this.renderActionProgress() }
				{ isEmpty( logs ) ? (
					noLogsContent
				) : (
					<section className="activity-log__wrapper">
						{ intoVisualGroups( moment, logs, this.getStartMoment(), this.applySiteOffset ).map(
							( [ type, [ start, end ], events ] ) => {
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
												disableRestore={ disableRestore }
												disableBackup={ disableBackup }
												isRewindActive={ 'active' === rewindState.state }
												logs={ events }
												closeDialog={ this.handleCloseDialog }
												siteId={ siteId }
												tsEndOfSiteDay={ start.valueOf() }
												isToday={ isToday }
											/>
										);
								}
							}
						) }
					</section>
				) }
				{ this.renderMonthNavigation( 'bottom' ) }
			</div>
		);
	}

	render() {
		const { canViewActivityLog, translate } = this.props;

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

		const { siteId, context, rewindState } = this.props;

		const rewindNoThanks = get( context, 'query.rewind-redirect', '' );
		const rewindIsNotReady =
			includes( [ 'uninitialized', 'awaitingCredentials' ], rewindState.state ) ||
			'vp_can_transfer' === rewindState.reason;

		return (
			<Main wideLayout>
				<QueryRewindState siteId={ siteId } />
				{ '' !== rewindNoThanks && rewindIsNotReady
					? siteId && <ActivityLogSwitch siteId={ siteId } redirect={ rewindNoThanks } />
					: this.getActivityLog() }
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
		const requestedRestoreId = getRequestedRewind( state, siteId );
		const requestedBackupId = getRequestedBackup( state, siteId );
		const logRequestQuery = getActivityLogQuery( { gmtOffset, startDate, timezone } );

		return {
			canViewActivityLog: canCurrentUser( state, siteId, 'manage_options' ),
			gmtOffset,
			logRequestQuery,
			logs: getActivityLogs(
				state,
				siteId,
				getActivityLogQuery( { gmtOffset, startDate, timezone } )
			),
			requestedRestore: getActivityLog( state, siteId, requestedRestoreId ),
			requestedRestoreId,
			requestedBackup: getActivityLog( state, siteId, requestedBackupId ),
			requestedBackupId,
			restoreProgress: getRestoreProgress( state, siteId ),
			backupProgress: getBackupProgress( state, siteId ),
			requestData: { logs: getRequest( state, activityLogRequest( siteId, logRequestQuery ) ) },
			rewindState: getRewindState( state, siteId ),
			siteId,
			siteTitle: getSiteTitle( state, siteId ),
			slug: getSiteSlug( state, siteId ),
			timezone,
			oldestItemTs: getOldestItemTs( state, siteId ),
		};
	},
	{
		changePeriod: ( { date, direction } ) =>
			recordTracksEvent( 'calypso_activitylog_monthpicker_change', {
				date: date.utc().toISOString(),
				direction,
			} ),
		createBackup: ( siteId, actionId ) =>
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_backup_confirm', { actionId } ),
				rewindBackup( siteId, actionId )
			),
		dismissBackup: siteId =>
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_backup_cancel' ),
				rewindBackupDismiss( siteId )
			),
		rewindRequestDismiss: siteId =>
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_restore_cancel' ),
				rewindRequestDismiss( siteId )
			),
		rewindRestore: ( siteId, actionId ) =>
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_restore_confirm', { actionId } ),
				rewindRestore( siteId, actionId )
			),
	}
)( localize( ActivityLog ) );
