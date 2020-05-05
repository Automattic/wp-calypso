/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import { isMobile } from '@automattic/viewport';
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, get, includes, isEmpty, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import ActivityLogBanner from '../activity-log-banner';
import ActivityLogExample from '../activity-log-example';
import ActivityLogItem from '../activity-log-item';
import ActivityLogAggregatedItem from '../activity-log-item/aggregated';
import ActivityLogSwitch from '../activity-log-switch';
import ActivityLogTasklist from '../activity-log-tasklist';
import Banner from 'components/banner';
import DocumentHead from 'components/data/document-head';
import EmptyContent from 'components/empty-content';
import ErrorBanner from '../activity-log-banner/error-banner';
import Filterbar from '../filterbar';
import UpgradeBanner from '../activity-log-banner/upgrade-banner';
import IntroBanner from '../activity-log-banner/intro-banner';
import { isFreePlan } from 'lib/plans';
import JetpackBackupCredsBanner from 'blocks/jetpack-backup-creds-banner';
import JetpackColophon from 'components/jetpack-colophon';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import Pagination from 'components/pagination';
import ProgressBanner from '../activity-log-banner/progress-banner';
import RewindAlerts from './rewind-alerts';
import QueryRewindState from 'components/data/query-rewind-state';
import QuerySitePurchases from 'components/data/query-site-purchases';
import QuerySiteSettings from 'components/data/query-site-settings'; // For site time offset
import QueryRewindBackupStatus from 'components/data/query-rewind-backup-status';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import SuccessBanner from '../activity-log-banner/success-banner';
import RewindUnavailabilityNotice from './rewind-unavailability-notice';
import { getSelectedSiteId } from 'state/ui/selectors';
import { siteHasBackupProductPurchase } from 'state/purchases/selectors';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getSiteSlug, getSiteTitle, isJetpackSite } from 'state/sites/selectors';
import {
	recordTracksEvent as recordTracksEventAction,
	withAnalytics,
} from 'state/analytics/actions';
import {
	getRewindRestoreProgress,
	rewindRequestDismiss,
	rewindRestore,
	rewindBackupDismiss,
	rewindBackup,
	updateFilter,
} from 'state/activity-log/actions';
import canCurrentUser from 'state/selectors/can-current-user';
import getActivityLogFilter from 'state/selectors/get-activity-log-filter';
import getBackupProgress from 'state/selectors/get-backup-progress';
import getRequestedBackup from 'state/selectors/get-requested-backup';
import getRequestedRewind from 'state/selectors/get-requested-rewind';
import getRestoreProgress from 'state/selectors/get-restore-progress';
import getRewindState from 'state/selectors/get-rewind-state';
import getSiteGmtOffset from 'state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'state/selectors/get-site-timezone-value';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';
import isVipSite from 'state/selectors/is-vip-site';
import siteSupportsRealtimeBackup from 'state/selectors/site-supports-realtime-backup';
import { requestActivityLogs } from 'state/data-getters';
import { emptyFilter } from 'state/activity-log/reducer';
import { recordTracksEvent } from 'lib/analytics/tracks';
import { applySiteOffset } from 'lib/site/timezone';
import { withLocalizedMoment } from 'components/localized-moment';
import { getPreference } from 'state/preferences/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const PAGE_SIZE = 20;

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
		this.findExistingRewind( this.props );
	}

	componentDidUpdate( prevProps ) {
		if ( ! prevProps.rewindState.rewind && this.props.rewindState.rewind ) {
			this.findExistingRewind( this.props );
		}
	}

	findExistingRewind = ( { siteId, rewindState } ) => {
		if ( rewindState.rewind && rewindState.rewind.restoreId ) {
			this.props.getRewindRestoreProgress( siteId, rewindState.rewind.restoreId );
		}
	};

	/**
	 * Close Restore, Backup, or Transfer confirmation dialog.
	 *
	 * @param {string} type Type of dialog to close.
	 */
	handleCloseDialog = ( type ) => {
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
	 * @param   {object} date Moment to adjust.
	 * @returns {object}      Moment adjusted for site timezone or gmtOffset.
	 */
	applySiteOffset = ( date ) => {
		const { timezone, gmtOffset } = this.props;
		return applySiteOffset( date, { timezone, gmtOffset } );
	};

	changePage = ( pageNumber ) => {
		recordTracksEvent( 'calypso_activitylog_change_page', { page: pageNumber } );
		this.props.selectPage( this.props.siteId, pageNumber );
		window.scrollTo( 0, 0 );
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

		if ( restoreProgress ) {
			cards.push(
				'finished' === restoreProgress.status
					? this.getEndBanner( siteId, restoreProgress )
					: this.getProgressBanner( siteId, restoreProgress, 'restore' )
			);
		}

		if ( backupProgress ) {
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
	 *
	 * @param   {number} siteId         Id of the site where the operation is performed.
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
			context,
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
				context={ context }
			/>
		);
	}

	/**
	 * Display a success or error card based on the last status of operation.
	 *
	 * @param   {number} siteId   Id of the site where the operation was performed.
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
			context,
		} = progress;
		const requestedRestoreId = this.props.requestedRestoreId || rewindId;
		return (
			<div key={ `end-banner-${ restoreId || downloadId }` }>
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
						context={ context }
					/>
				) : (
					<SuccessBanner
						key={ `success-${ restoreId || downloadId }` }
						applySiteOffset={ this.applySiteOffset }
						siteId={ siteId }
						timestamp={ rewindId }
						downloadId={ downloadId }
						restoreId={ restoreId }
						backupUrl={ url }
						downloadCount={ downloadCount }
						context={ context }
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

	renderNoLogsContent() {
		const { filter, logLoadingState, siteId, translate, siteHasNoLog, slug } = this.props;

		const isFilterEmpty = isEqual( emptyFilter, filter );

		if ( logLoadingState === 'success' ) {
			return isFilterEmpty ? (
				<ActivityLogExample siteId={ siteId } siteIsOnFreePlan={ siteHasNoLog } />
			) : (
				<Fragment>
					<EmptyContent
						title={ translate( 'No matching events found.' ) }
						line={ translate( 'Try adjusting your date range or activity type filters' ) }
						action={ translate( 'Remove all filters' ) }
						actionURL={ '/activity-log/' + slug }
					/>
				</Fragment>
			);
		}

		// The network request is still ongoing
		return (
			<section className="activity-log__wrapper">
				<div className="activity-log__time-period is-loading">
					<span />
				</div>
				{ [ 1, 2, 3 ].map( ( i ) => (
					<div key={ i } className="activity-log-item is-loading">
						<div className="activity-log-item__type">
							<div className="activity-log-item__activity-icon" />
						</div>
						<div className="card foldable-card activity-log-item__card" />
					</div>
				) ) }
			</section>
		);
	}

	getActivityLog() {
		const {
			enableRewind,
			filter: { page: requestedPage },
			logs,
			moment,
			rewindState,
			siteId,
			siteHasNoLog,
			translate,
			isAtomic,
			isJetpack,
			isIntroDismissed,
			supportsRealtimeBackup,
		} = this.props;

		const disableRestore =
			! enableRewind ||
			includes( [ 'queued', 'running' ], get( this.props, [ 'restoreProgress', 'status' ] ) ) ||
			'active' !== rewindState.state;
		const disableBackup = 0 <= get( this.props, [ 'backupProgress', 'progress' ], -Infinity );

		const actualPage = Math.max(
			1,
			Math.min( requestedPage, Math.ceil( logs.length / PAGE_SIZE ) )
		);
		const theseLogs = logs.slice( ( actualPage - 1 ) * PAGE_SIZE, actualPage * PAGE_SIZE );

		const timePeriod = ( () => {
			const today = this.applySiteOffset( moment() );
			let last = null;

			return ( { rewindId } ) => {
				const ts = this.applySiteOffset( moment( rewindId * 1000 ) );

				if ( null === last || ! ts.isSame( last, 'day' ) ) {
					last = ts;
					return (
						<h2 className="activity-log__time-period" key={ `time-period-${ ts }` }>
							{ ts.isSame( today, 'day' )
								? ts.format( translate( 'LL[ — Today]', { context: 'moment format string' } ) )
								: ts.format( 'LL' ) }
						</h2>
					);
				}

				return null;
			};
		} )();

		const provisioningText = supportsRealtimeBackup
			? translate(
					"We're currently backing up your site for the first time, and we'll let you know when we're finished. " +
						"After this initial backup, we'll save future changes in real time."
			  )
			: translate(
					"We're currently backing up your site for the first time, and we'll let you know when we're finished. " +
						"After this initial backup, we'll save future changes every day."
			  );

		return (
			<>
				{ siteId && 'active' === rewindState.state && (
					<QueryRewindBackupStatus siteId={ siteId } />
				) }
				<QuerySiteSettings siteId={ siteId } />
				<QuerySitePurchases siteId={ siteId } />

				<SidebarNavigation />

				<JetpackBackupCredsBanner event={ 'activity-backup-credentials' } />

				<FormattedHeader
					className="activity-log__page-heading"
					headerText={ translate( 'Activity' ) }
					subHeaderText={ translate(
						"Keep tabs on all your site's activity — plugin and theme updates, user logins, " +
							'setting modifications, and more.'
					) }
					align="left"
				/>

				{ siteId && isJetpack && ! isAtomic && <RewindAlerts siteId={ siteId } /> }
				{ siteId && 'unavailable' === rewindState.state && (
					<RewindUnavailabilityNotice siteId={ siteId } />
				) }
				{ 'provisioning' === rewindState.state && (
					<Banner
						icon="history"
						disableHref
						title={ translate( 'Your backup is underway' ) }
						description={ provisioningText }
					/>
				) }
				<IntroBanner siteId={ siteId } />
				{ siteHasNoLog && isIntroDismissed && <UpgradeBanner siteId={ siteId } /> }
				{ siteId && isJetpack && <ActivityLogTasklist siteId={ siteId } /> }
				{ this.renderErrorMessage() }
				{ this.renderActionProgress() }
				{ this.renderFilterbar() }
				{ isEmpty( logs ) ? (
					this.renderNoLogsContent()
				) : (
					<div>
						<Pagination
							compact={ isMobile() }
							className="activity-log__pagination"
							key="activity-list-pagination-top"
							nextLabel={ translate( 'Older' ) }
							page={ actualPage }
							pageClick={ this.changePage }
							perPage={ PAGE_SIZE }
							prevLabel={ translate( 'Newer' ) }
							total={ logs.length }
						/>
						<section className="activity-log__wrapper">
							{ siteHasNoLog && <div className="activity-log__fader" /> }
							{ theseLogs.map( ( log ) =>
								log.isAggregate ? (
									<Fragment key={ log.activityId }>
										{ timePeriod( log ) }
										<ActivityLogAggregatedItem
											key={ log.activityId }
											activity={ log }
											disableRestore={ disableRestore }
											disableBackup={ disableBackup }
											siteId={ siteId }
											rewindState={ rewindState.state }
										/>
									</Fragment>
								) : (
									<Fragment key={ log.activityId }>
										{ timePeriod( log ) }
										<ActivityLogItem
											key={ log.activityId }
											activity={ log }
											disableRestore={ disableRestore }
											disableBackup={ disableBackup }
											siteId={ siteId }
										/>
									</Fragment>
								)
							) }
						</section>
						{ siteHasNoLog && ! isIntroDismissed && <UpgradeBanner siteId={ siteId } /> }
						<Pagination
							compact={ isMobile() }
							className="activity-log__pagination is-bottom-pagination"
							key="activity-list-pagination-bottom"
							nextLabel={ translate( 'Older' ) }
							page={ actualPage }
							pageClick={ this.changePage }
							perPage={ PAGE_SIZE }
							prevLabel={ translate( 'Newer' ) }
							total={ logs.length }
						/>
					</div>
				) }
			</>
		);
	}

	renderFilterbar() {
		const { siteId, filter, logs, siteHasNoLog, logLoadingState } = this.props;
		const isFilterEmpty = isEqual( emptyFilter, filter );

		if ( siteHasNoLog ) {
			return null;
		}

		return (
			<Filterbar
				siteId={ siteId }
				filter={ filter }
				isLoading={ logLoadingState !== 'success' }
				isVisible={ ! ( isEmpty( logs ) && isFilterEmpty ) }
			/>
		);
	}

	render() {
		const { canViewActivityLog, siteId, translate } = this.props;

		if ( false === canViewActivityLog ) {
			return (
				<Main>
					<QuerySitePurchases siteId={ siteId } />
					<SidebarNavigation />
					<EmptyContent
						title={ translate( 'You are not authorized to view this page' ) }
						illustration={ '/calypso/images/illustrations/illustration-404.svg' }
					/>
				</Main>
			);
		}

		const { context, rewindState } = this.props;

		const rewindNoThanks = get( context, 'query.rewind-redirect', '' );
		const rewindIsNotReady =
			includes( [ 'uninitialized', 'awaitingCredentials' ], rewindState.state ) ||
			'vp_can_transfer' === rewindState.reason;

		return (
			<Main wideLayout>
				<QuerySitePurchases siteId={ siteId } />
				<PageViewTracker path="/activity-log/:site" title="Activity" />
				<DocumentHead title={ translate( 'Activity' ) } />
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

const emptyList = [];

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const gmtOffset = getSiteGmtOffset( state, siteId );
		const timezone = getSiteTimezoneValue( state, siteId );
		const requestedRestoreId = getRequestedRewind( state, siteId );
		const requestedBackupId = getRequestedBackup( state, siteId );
		const rewindState = getRewindState( state, siteId );
		const restoreStatus = rewindState.rewind && rewindState.rewind.status;
		const filter = getActivityLogFilter( state, siteId );
		const logs = siteId && requestActivityLogs( siteId, filter );
		const siteIsOnFreePlan =
			isFreePlan( get( getCurrentPlan( state, siteId ), 'productSlug' ) ) &&
			! isVipSite( state, siteId );
		const siteHasNoLog = siteIsOnFreePlan && ! siteHasBackupProductPurchase( state, siteId );
		const isJetpack = isJetpackSite( state, siteId );

		return {
			canViewActivityLog: canCurrentUser( state, siteId, 'manage_options' ),
			gmtOffset,
			enableRewind:
				'active' === rewindState.state &&
				! ( 'queued' === restoreStatus || 'running' === restoreStatus ),
			filter,
			isAtomic: isAtomicSite( state, siteId ),
			isJetpack,
			logs: ( siteId && logs.data ) || emptyList,
			logLoadingState: logs && logs.state,
			requestedRestore: find( logs, { activityId: requestedRestoreId } ),
			requestedRestoreId,
			requestedBackup: find( logs, { activityId: requestedBackupId } ),
			requestedBackupId,
			restoreProgress: getRestoreProgress( state, siteId ),
			backupProgress: getBackupProgress( state, siteId ),
			rewindState,
			siteId,
			siteTitle: getSiteTitle( state, siteId ),
			slug: getSiteSlug( state, siteId ),
			timezone,
			siteHasNoLog,
			isIntroDismissed: getPreference( state, 'dismissible-card-activity-introduction-banner' ),
			supportsRealtimeBackup: siteSupportsRealtimeBackup( state, siteId ),
		};
	},
	{
		changePeriod: ( { date, direction } ) =>
			recordTracksEventAction( 'calypso_activitylog_monthpicker_change', {
				date: date.utc().toISOString(),
				direction,
			} ),
		createBackup: ( siteId, actionId ) =>
			withAnalytics(
				recordTracksEventAction( 'calypso_activitylog_backup_confirm', { action_id: actionId } ),
				rewindBackup( siteId, actionId )
			),
		dismissBackup: ( siteId ) =>
			withAnalytics(
				recordTracksEventAction( 'calypso_activitylog_backup_cancel' ),
				rewindBackupDismiss( siteId )
			),
		getRewindRestoreProgress,
		rewindRequestDismiss: ( siteId ) =>
			withAnalytics(
				recordTracksEventAction( 'calypso_activitylog_restore_cancel' ),
				rewindRequestDismiss( siteId )
			),
		rewindRestore: ( siteId, actionId ) =>
			withAnalytics(
				recordTracksEventAction( 'calypso_activitylog_restore_confirm', { action_id: actionId } ),
				rewindRestore( siteId, actionId )
			),
		selectPage: ( siteId, pageNumber ) => updateFilter( siteId, { page: pageNumber } ),
	}
)( localize( withLocalizedMoment( ActivityLog ) ) );
