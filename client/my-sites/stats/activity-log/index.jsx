/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import debugFactory from 'debug';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import {
	filter,
	get,
	groupBy,
	includes,
	map,
	isEmpty,
} from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getSiteSlug,
	getSiteTitle,
} from 'state/sites/selectors';
import StatsFirstView from '../stats-first-view';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import StatsNavigation from '../stats-navigation';
import ActivityLogConfirmDialog from '../activity-log-confirm-dialog';
import ActivityLogDay from '../activity-log-day';
import ActivityLogBanner from '../activity-log-banner';
import ErrorBanner from '../activity-log-banner/error-banner';
import ProgressBanner from '../activity-log-banner/progress-banner';
import SuccessBanner from '../activity-log-banner/success-banner';
import QueryRewindStatus from 'components/data/query-rewind-status';
import QueryActivityLog from 'components/data/query-activity-log';
// For site time offset
import QuerySiteSettings from 'components/data/query-site-settings';
import DatePicker from 'my-sites/stats/stats-date-picker';
import StatsPeriodNavigation from 'my-sites/stats/stats-period-navigation';
import ActivityLogRewindToggle from './activity-log-rewind-toggle';
import ListEnd from 'components/list-end';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';
import { rewindRestore as rewindRestoreAction } from 'state/activity-log/actions';
import {
	getActivityLogs,
	getRestoreProgress,
	getRewindStatusError,
	getSiteGmtOffset,
	getSiteTimezoneValue,
	isRewindActive as isRewindActiveSelector,
} from 'state/selectors';

const debug = debugFactory( 'calypso:activity-log' );

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

	state = {
		requestedRestoreTimestamp: null,
		showRestoreConfirmDialog: false,
	};

	componentDidMount() {
		window.scrollTo( 0, 0 );
	}

	handlePeriodChange = ( { date, direction } ) => {
		this.props.recordTracksEvent( 'calypso_activitylog_monthpicker_change', {
			date: date.utc().toISOString(),
			direction,
		} );
	}

	handleRequestRestore = ( requestedRestoreTimestamp, from ) => {
		this.props.recordTracksEvent( 'calypso_activitylog_restore_request', {
			from,
			timestamp: requestedRestoreTimestamp,
		} );
		this.setState( {
			requestedRestoreTimestamp,
			showRestoreConfirmDialog: true,
		} );
	};

	handleRestoreDialogClose = () => {
		this.props.recordTracksEvent( 'calypso_activitylog_restore_cancel', {
			timestamp: this.state.requestedRestoreTimestamp,
		} );
		this.setState( { showRestoreConfirmDialog: false } );
	};

	handleRestoreDialogConfirm = () => {
		const {
			recordTracksEvent,
			rewindRestore,
			siteId,
		} = this.props;
		const { requestedRestoreTimestamp } = this.state;

		recordTracksEvent( 'calypso_activitylog_restore_confirm', {
			timestamp: requestedRestoreTimestamp,
		} );
		debug( 'Restore requested for site %d to time %d', this.props.siteId, requestedRestoreTimestamp );
		this.setState( { showRestoreConfirmDialog: false } );
		rewindRestore( siteId, requestedRestoreTimestamp );
	};

	/**
	 * Creates a function that will offset a moment by the site
	 * timezone or gmt offset. Use the resulting function wherever
	 * log times need to be formatted for display to ensure all times
	 * are displayed as site times.
	 *
	 * @returns {function} func that takes a moment and returns moment offset by site timezone or offset
	 */
	getSiteOffsetFunc() {
		const { timezone, gmtOffset } = this.props;
		return ( moment ) => {
			if ( timezone ) {
				return moment.tz( timezone );
			}
			if ( gmtOffset ) {
				return moment.utcOffset( gmtOffset );
			}
			return moment;
		};
	}

	isRestoreInProgress() {
		return includes( [
			'queued',
			'running',
		], get( this.props, [ 'restoreProgress', 'status' ] ) );
	}

	renderBanner() {
		const {
			restoreProgress,
			siteId,
		} = this.props;

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
							timestamp={ timestamp } />
					) : (
						<SuccessBanner
							siteId={ siteId }
							timestamp={ timestamp } />
					) }
				</div>
			);
		}
		return (
			<ProgressBanner
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
		const {
			isPressable,
			rewindStatusError,
			translate,
		} = this.props;

		// Do not match null
		// FIXME: This is for internal testing
		if ( false === isPressable ) {
			return (
				<ActivityLogBanner status="info" icon={ null } >
					{ translate( 'Rewind is currently only available for Pressable sites' ) }
				</ActivityLogBanner>
			);
		}

		if ( rewindStatusError ) {
			return (
				<ActivityLogBanner status="error" icon={ null } >
					{ translate( 'Rewind error: %s', { args: rewindStatusError.message } ) }
					<br />
					{ translate( 'Do you have an appropriate plan?' ) }
				</ActivityLogBanner>
			);
		}
	}

	renderContent() {
		const {
			isPressable,
			isRewindActive,
			logs,
			moment,
			siteId,
			slug,
			startDate,
		} = this.props;

		const disableRestore = this.isRestoreInProgress();

		const applySiteOffset = this.getSiteOffsetFunc();

		const YEAR_MONTH = 'YYYY-MM';
		const selectedMonthAndYear = moment( startDate ).format( YEAR_MONTH );
		const logsForMonth = filter( logs, ( { ts_utc } ) => {
			return applySiteOffset( moment.utc( ts_utc ) ).format( YEAR_MONTH ) === selectedMonthAndYear;
		} );

		const logsGroupedByDay = map(
			groupBy(
				logsForMonth,
				log => applySiteOffset( moment.utc( log.ts_utc ) ).endOf( 'day' ).valueOf()
			),
			( daily_logs, tsEndOfSiteDay ) => (
				<ActivityLogDay
					applySiteOffset={ applySiteOffset }
					disableRestore={ disableRestore }
					hideRestore={ ! isPressable }
					isRewindActive={ isRewindActive }
					key={ tsEndOfSiteDay }
					logs={ daily_logs }
					requestRestore={ this.handleRequestRestore }
					siteId={ siteId }
					tsEndOfSiteDay={ +tsEndOfSiteDay }
				/>
			)
		);

		const startOfMonth = moment.utc( startDate ).startOf( 'month' );
		const query = {
			period: 'month',
			date: startOfMonth.format( 'YYYY-MM-DD' )
		};

		return (
			<div>
				<StatsPeriodNavigation
					date={ startOfMonth }
					onPeriodChange={ this.handlePeriodChange }
					period="month"
					url={ `/stats/activity/${ slug }` }
				>
					<DatePicker
						isActivity={ true }
						period="month"
						date={ startOfMonth }
						query={ query }
					/>
				</StatsPeriodNavigation>
				{ this.renderBanner() }
				{ ! isRewindActive && !! isPressable && <ActivityLogRewindToggle siteId={ siteId } /> }
				<section className="activity-log__wrapper">
					{ logsGroupedByDay }
				</section>
				{ ! isEmpty( logsGroupedByDay ) && <ListEnd /> }
			</div>
		);
	}

	render() {
		const {
			siteId,
			siteTitle,
			slug,
		} = this.props;
		const {
			requestedRestoreTimestamp,
			showRestoreConfirmDialog,
		} = this.state;
		const applySiteOffset = this.getSiteOffsetFunc();

		return (
			<Main wideLayout>
				<QueryRewindStatus siteId={ siteId } />
				<QueryActivityLog siteId={ siteId } />
				<QuerySiteSettings siteId={ siteId } />
				<StatsFirstView />
				<SidebarNavigation />
				<StatsNavigation
					section="activity"
					siteId={ siteId }
					slug={ slug }
				/>
				{ this.renderErrorMessage() }
				{ this.renderContent() }
				<ActivityLogConfirmDialog
					applySiteOffset={ applySiteOffset }
					isVisible={ showRestoreConfirmDialog }
					siteTitle={ siteTitle }
					timestamp={ requestedRestoreTimestamp }
					onClose={ this.handleRestoreDialogClose }
					onConfirm={ this.handleRestoreDialogConfirm }
				/>
			</Main>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			logs: getActivityLogs( state, siteId ),
			siteId,
			siteTitle: getSiteTitle( state, siteId ),
			slug: getSiteSlug( state, siteId ),
			rewindStatusError: getRewindStatusError( state, siteId ),
			restoreProgress: getRestoreProgress( state, siteId ),
			isRewindActive: isRewindActiveSelector( state, siteId ),

			// FIXME: Testing only
			isPressable: get( state.activityLog.rewindStatus, [ siteId, 'isPressable' ], null ),
			timezone: getSiteTimezoneValue( state, siteId ),
			gmtOffset: getSiteGmtOffset( state, siteId ),
		};
	}, {
		recordTracksEvent: recordTracksEventAction,
		rewindRestore: rewindRestoreAction,
	}
)( localize( ActivityLog ) );
