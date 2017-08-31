/** @format */
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
import { get, includes } from 'lodash';

/**
 * Internal dependencies
 */
import ActivityLogBanner from '../activity-log-banner';
import ActivityLogConfirmDialog from '../activity-log-confirm-dialog';
import ActivityLogDay from '../activity-log-day';
import ActivityLogRewindToggle from './activity-log-rewind-toggle';
import DatePicker from 'my-sites/stats/stats-date-picker';
import EmptyContent from 'components/empty-content';
import ErrorBanner from '../activity-log-banner/error-banner';
import JetpackColophon from 'components/jetpack-colophon';
import Main from 'components/main';
import ProgressBanner from '../activity-log-banner/progress-banner';
import QueryRewindStatus from 'components/data/query-rewind-status';
import QuerySiteSettings from 'components/data/query-site-settings'; // For site time offset
import SidebarNavigation from 'my-sites/sidebar-navigation';
import StatsFirstView from '../stats-first-view';
import StatsNavigation from '../stats-navigation';
import StatsPeriodNavigation from 'my-sites/stats/stats-period-navigation';
import SuccessBanner from '../activity-log-banner/success-banner';
import { adjustMoment } from './utils';
import { canCurrentUser } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug, getSiteTitle } from 'state/sites/selectors';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';
import { rewindRestore as rewindRestoreAction } from 'state/activity-log/actions';
import {
	getRestoreProgress,
	getRewindStatusError,
	getSiteGmtOffset,
	getSiteTimezoneValue,
	isRewindActive as isRewindActiveSelector,
} from 'state/selectors';

/**
 * Module constants
 */
const debug = debugFactory( 'calypso:activity-log' );
const rewindEnabledByConfig = config.isEnabled( 'jetpack/activity-log/rewind' );

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

	getStartMoment() {
		const { gmtOffset, moment, startDate, timezone } = this.props;

		if ( timezone ) {
			if ( ! startDate ) {
				return moment().tz( timezone );
			}

			return moment.tz( startDate, timezone );
		}

		if ( null !== gmtOffset ) {
			return moment.utc( startDate ).subtract( gmtOffset, 'hours' ).utcOffset( gmtOffset );
		}

		return moment.utc( startDate );
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
		const { recordTracksEvent, rewindRestore, siteId } = this.props;
		const { requestedRestoreTimestamp } = this.state;

		recordTracksEvent( 'calypso_activitylog_restore_confirm', {
			timestamp: requestedRestoreTimestamp,
		} );
		debug(
			'Restore requested for site %d to time %d',
			this.props.siteId,
			requestedRestoreTimestamp
		);
		this.setState( { showRestoreConfirmDialog: false } );
		rewindRestore( siteId, requestedRestoreTimestamp );
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
					{ errorCode
						? <ErrorBanner
								errorCode={ errorCode }
								failureReason={ failureReason }
								requestRestore={ this.handleRequestRestore }
								siteId={ siteId }
								siteTitle={ siteTitle }
								timestamp={ timestamp }
							/>
						: <SuccessBanner
								applySiteOffset={ this.applySiteOffset }
								siteId={ siteId }
								timestamp={ timestamp }
							/> }
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

	renderMonth() {
		const { isPressable, isRewindActive, moment, siteId } = this.props;
		const startMoment = this.getStartMoment();

		// FIXME: Restore empty content

		const disableRestore = this.isRestoreInProgress();
		const activityDays = [];

		// loop backwards through each day in the month
		for (
			const m = moment.min(
					startMoment.clone().endOf( 'month' ).startOf( 'day' ),
					this.applySiteOffset( moment.utc() ).startOf( 'day' )
				),
				startOfMonth = startMoment.clone().startOf( 'month' ).valueOf();
			startOfMonth <= m.valueOf();
			m.subtract( 1, 'day' )
		) {
			const dayEnd = m.endOf( 'day' ).valueOf();
			const dayStart = m.startOf( 'day' ).valueOf();
			activityDays.push(
				<ActivityLogDay
					applySiteOffset={ this.applySiteOffset }
					disableRestore={ disableRestore }
					hideRestore={ ! rewindEnabledByConfig || ! isPressable }
					isRewindActive={ isRewindActive }
					key={ dayEnd }
					requestRestore={ this.handleRequestRestore }
					siteId={ siteId }
					tsEndOfSiteDay={ dayEnd }
					tsStartOfSiteDay={ dayStart }
				/>
			);
		}

		return (
			<section className="activity-log__wrapper">
				{ activityDays }
			</section>
		);
	}

	renderMonthNavigation( position ) {
		const { slug } = this.props;
		const startOfMonth = this.getStartMoment().startOf( 'month' );
		const query = {
			period: 'month',
			date: startOfMonth.format( 'YYYY-MM-DD' ),
		};

		// FIXME: Restore empty content no bottom nav.
		// if ( position === 'bottom' && ( ! isNull( logs ) && isEmpty( logs ) ) ) {
		// 	return null;
		// }

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
			isPressable,
			isRewindActive,
			siteId,
			siteTitle,
			slug,
			translate,
		} = this.props;

		if ( false === canViewActivityLog ) {
			return (
				<Main>
					<SidebarNavigation />
					<EmptyContent
						title={ translate( 'You are not authorized to view this page' ) }
						illustration={ '/calypso/images/illustrations/illustration-empty-results.svg' }
					/>
				</Main>
			);
		}

		const { requestedRestoreTimestamp, showRestoreConfirmDialog } = this.state;

		return (
			<Main wideLayout>
				{ rewindEnabledByConfig && <QueryRewindStatus siteId={ siteId } /> }
				<QuerySiteSettings siteId={ siteId } />
				<StatsFirstView />
				<SidebarNavigation />
				<StatsNavigation section="activity" siteId={ siteId } slug={ slug } />
				{ this.renderErrorMessage() }
				{ this.renderMonthNavigation() }
				{ this.renderBanner() }
				{ ! isRewindActive && !! isPressable && <ActivityLogRewindToggle siteId={ siteId } /> }
				{ this.renderMonth() }
				{ this.renderMonthNavigation( 'bottom' ) }

				<ActivityLogConfirmDialog
					applySiteOffset={ this.applySiteOffset }
					isVisible={ showRestoreConfirmDialog }
					siteTitle={ siteTitle }
					timestamp={ requestedRestoreTimestamp }
					onClose={ this.handleRestoreDialogClose }
					onConfirm={ this.handleRestoreDialogConfirm }
				/>
				<JetpackColophon />
			</Main>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );

		return {
			canViewActivityLog: canCurrentUser( state, siteId, 'manage_options' ),
			gmtOffset: getSiteGmtOffset( state, siteId ),
			isRewindActive: isRewindActiveSelector( state, siteId ),
			restoreProgress: getRestoreProgress( state, siteId ),
			rewindStatusError: getRewindStatusError( state, siteId ),
			siteId,
			siteTitle: getSiteTitle( state, siteId ),
			slug: getSiteSlug( state, siteId ),
			timezone: getSiteTimezoneValue( state, siteId ),

			// FIXME: Testing only
			isPressable: get( state.activityLog.rewindStatus, [ siteId, 'isPressable' ], null ),
		};
	},
	{
		recordTracksEvent: recordTracksEventAction,
		rewindRestore: rewindRestoreAction,
	}
)( localize( ActivityLog ) );
