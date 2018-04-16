/** @format */
/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, includes, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import ActivityLogBanner from 'my-sites/stats/activity-log-banner';
import ActivityLogItem from '../activity-log-item';
import ActivityLogSwitch from '../activity-log-switch';
import Banner from 'components/banner';
import DocumentHead from 'components/data/document-head';
import EmptyContent from 'components/empty-content';
import ErrorBanner from '../activity-log-banner/error-banner';
import FoldableCard from 'components/foldable-card';
import JetpackColophon from 'components/jetpack-colophon';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import Pagination from 'components/pagination';
import ProgressBanner from '../activity-log-banner/progress-banner';
import QueryActivityLog from 'components/data/query-activity-log';
import QueryRewindState from 'components/data/query-rewind-state';
import QuerySiteSettings from 'components/data/query-site-settings'; // For site time offset
import QueryRewindBackupStatus from 'components/data/query-rewind-backup-status';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins/';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import StatsNavigation from 'blocks/stats-navigation';
import SuccessBanner from '../activity-log-banner/success-banner';
import UnavailabilityNotice from './unavailability-notice';
import { adjustMoment, getActivityLogQuery, getStartMoment } from './utils';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug, getSiteTitle } from 'state/sites/selectors';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import {
	activityLogRequest,
	getRewindRestoreProgress,
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

const PAGE_SIZE = 100;

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

	state = {
		currentPage: 1,
	};

	componentDidMount() {
		window.scrollTo( 0, 0 );
		this.findExistingRewind( this.props );
	}

	componentWillUpdate( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			this.setState( { currentPage: 1 } );
		}
	}

	componentDidUpdate( prevProps ) {
		if ( ! prevProps.rewindState.rewind && this.props.rewindState.rewind ) {
			this.findExistingRewind( this.props );
		}
	}

	findExistingRewind = ( { siteId, rewindState } ) => {
		if ( rewindState.rewind ) {
			this.props.getRewindRestoreProgress( siteId, rewindState.rewind.restoreId );
		}
	};

	getStartMoment() {
		const { gmtOffset, startDate, timezone } = this.props;
		return getStartMoment( { gmtOffset, startDate, timezone } );
	}

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

	changePage = currentPage => this.setState( { currentPage }, () => window.scrollTo( 0, 0 ) );

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

	getActivityLog() {
		const {
			enableRewind,
			logRequestQuery,
			logs,
			moment,
			requestData,
			rewindState,
			siteId,
			slug,
			translate,
		} = this.props;

		const { currentPage } = this.state;

		const disableRestore =
			! enableRewind ||
			includes( [ 'queued', 'running' ], get( this.props, [ 'restoreProgress', 'status' ] ) ) ||
			'active' !== rewindState.state;
		const disableBackup = 0 <= get( this.props, [ 'backupProgress', 'progress' ], -Infinity );

		const theseLogs = logs.slice( ( currentPage - 1 ) * PAGE_SIZE, currentPage * PAGE_SIZE );

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
				{ [ 1, 2, 3 ].map( i => (
					<FoldableCard
						key={ i }
						className="activity-log-day__placeholder"
						header={
							<div>
								<div className="activity-log-day__day" />
								<div className="activity-log-day__events" />
							</div>
						}
					/>
				) ) }
			</section>
		);

		const timePeriod = ( () => {
			let last = null;

			return ( { rewindId } ) => {
				const ts = 1000 * rewindId;

				if ( null === last || moment( ts ).format( 'D' ) !== moment( last ).format( 'D' ) ) {
					last = ts;
					return (
						<h2 className="activity-log__time-period" key={ `time-period-${ ts }` }>
							{ moment( ts ).format( 'LL' ) }
						</h2>
					);
				}

				return null;
			};
		} )();

		return (
			<div>
				<QueryActivityLog siteId={ siteId } { ...logRequestQuery } />
				{ siteId &&
					'active' === rewindState.state && <QueryRewindBackupStatus siteId={ siteId } /> }
				<QuerySiteSettings siteId={ siteId } />
				<SidebarNavigation />
				<StatsNavigation selectedItem={ 'activity' } siteId={ siteId } slug={ slug } />
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
				{ this.renderActionProgress() }
				{ isEmpty( logs ) ? (
					noLogsContent
				) : (
					<div>
						<section className="activity-log__wrapper">
							{ theseLogs.map( log => (
								<Fragment key={ log.activityId }>
									{ timePeriod( log ) }
									<ActivityLogItem
										key={ log.activityId }
										activityId={ log.activityId }
										disableRestore={ disableRestore }
										disableBackup={ disableBackup }
										hideRestore={ 'active' !== rewindState.state }
										siteId={ siteId }
									/>
								</Fragment>
							) ) }
						</section>
						<Pagination
							className="activity-log__pagination"
							key="activity-list-pagination"
							nextLabel={ translate( 'Older' ) }
							page={ this.state.currentPage }
							pageClick={ this.changePage }
							perPage={ PAGE_SIZE }
							prevLabel={ translate( 'Newer' ) }
							total={ logs.length }
						/>
					</div>
				) }
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
				<PageViewTracker path="/stats/activity/:site" title="Stats > Activity" />
				<DocumentHead title={ translate( 'Stats' ) } />
				{ siteId && <QueryRewindState siteId={ siteId } /> }
				{ siteId && <QueryJetpackPlugins siteIds={ [ siteId ] } /> }
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
		const rewindState = getRewindState( state, siteId );
		const restoreStatus = rewindState.rewind && rewindState.rewind.status;

		return {
			canViewActivityLog: canCurrentUser( state, siteId, 'manage_options' ),
			gmtOffset,
			enableRewind:
				'active' === rewindState.state &&
				! ( 'queued' === restoreStatus || 'running' === restoreStatus ),
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
			rewindState,
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
				recordTracksEvent( 'calypso_activitylog_backup_confirm', { action_id: actionId } ),
				rewindBackup( siteId, actionId )
			),
		dismissBackup: siteId =>
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_backup_cancel' ),
				rewindBackupDismiss( siteId )
			),
		getRewindRestoreProgress,
		rewindRequestDismiss: siteId =>
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_restore_cancel' ),
				rewindRequestDismiss( siteId )
			),
		rewindRestore: ( siteId, actionId ) =>
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_restore_confirm', { action_id: actionId } ),
				rewindRestore( siteId, actionId )
			),
	}
)( localize( ActivityLog ) );
