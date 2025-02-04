/* eslint-disable wpcalypso/jsx-classname-namespace */

import { WPCOM_FEATURES_FULL_ACTIVITY_LOG } from '@automattic/calypso-products';
import { isMobile } from '@automattic/viewport';
import { localize } from 'i18n-calypso';
import { get, isEmpty, isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { Component, Fragment, createRef } from 'react';
import { connect, useSelector } from 'react-redux';
import TimeMismatchWarning from 'calypso/blocks/time-mismatch-warning';
import VisibleDaysLimitUpsell from 'calypso/components/activity-card-list/visible-days-limit-upsell';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackCredentialsStatus from 'calypso/components/data/query-jetpack-credentials-status';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QueryRewindBackupStatus from 'calypso/components/data/query-rewind-backup-status';
import QueryRewindBackups from 'calypso/components/data/query-rewind-backups';
import QueryRewindPolicies from 'calypso/components/data/query-rewind-policies';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import QuerySiteSettings from 'calypso/components/data/query-site-settings'; // For site time offset
import EmptyContent from 'calypso/components/empty-content';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import Pagination from 'calypso/components/pagination';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import useActivityLogQuery from 'calypso/data/activity-log/use-activity-log-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { withSyncStatus } from 'calypso/sites/tools/staging-site/hooks/use-site-sync-status';
import {
	getRewindRestoreProgress,
	rewindRequestDismiss,
	rewindRestore,
	rewindBackupDismiss,
	rewindBackup,
	updateFilter,
} from 'calypso/state/activity-log/actions';
import { emptyFilter } from 'calypso/state/activity-log/reducer';
import {
	recordTracksEvent as recordTracksEventAction,
	withAnalytics,
} from 'calypso/state/analytics/actions';
import { updateBreadcrumbs } from 'calypso/state/breadcrumb/actions';
import { areJetpackCredentialsInvalid } from 'calypso/state/jetpack/credentials/selectors';
import { getPreference } from 'calypso/state/preferences/selectors';
import getActivityLogVisibleDays from 'calypso/state/rewind/selectors/get-activity-log-visible-days';
import getRewindPoliciesRequestStatus from 'calypso/state/rewind/selectors/get-rewind-policies-request-status';
import getActivityLogFilter from 'calypso/state/selectors/get-activity-log-filter';
import getBackupProgress from 'calypso/state/selectors/get-backup-progress';
import getRequestedRewind from 'calypso/state/selectors/get-requested-rewind';
import getRestoreProgress from 'calypso/state/selectors/get-restore-progress';
import getRewindBackups from 'calypso/state/selectors/get-rewind-backups';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import getSettingsUrl from 'calypso/state/selectors/get-settings-url';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import {
	getSiteSlug,
	getSiteTitle,
	isJetpackSite,
	isJetpackSiteMultiSite,
} from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ActivityLogBanner from '../activity-log-banner';
import ErrorBanner from '../activity-log-banner/error-banner';
import IntroBanner from '../activity-log-banner/intro-banner';
import ProgressBanner from '../activity-log-banner/progress-banner';
import SuccessBanner from '../activity-log-banner/success-banner';
import UpgradeBanner from '../activity-log-banner/upgrade-banner';
import ActivityLogExample from '../activity-log-example';
import ActivityLogItem from '../activity-log-item';
import ActivityLogAggregatedItem from '../activity-log-item/aggregated';
import ActivityLogSwitch from '../activity-log-switch';
import ActivityLogTasklist from '../activity-log-tasklist';
import Filterbar from '../filterbar';
import RewindAlerts from './rewind-alerts';
import RewindUnavailabilityNotice from './rewind-unavailability-notice';

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
		isMultisite: PropTypes.bool,
		hideRewindProgress: PropTypes.bool,
	};

	state = {
		initialFilterBarY: 0,
		masterBarHeight: 0,
		scrollTicking: false,
	};

	filterBarRef = createRef();

	componentDidMount() {
		window.scrollTo( 0, 0 );
		this.findExistingRewind();
		this.initializeBreadcrumbs();

		if ( isMobile() ) {
			// Filter bar is only sticky on mobile
			window.addEventListener( 'scroll', this.onScroll );
		}
	}

	componentWillUnmount() {
		window.removeEventListener( 'scroll', this.onScroll );
	}

	componentDidUpdate( prevProps ) {
		if ( ! prevProps.rewindState.rewind && this.props.rewindState.rewind ) {
			this.findExistingRewind();
		}
	}

	findExistingRewind() {
		const { siteId, rewindState } = this.props;
		if ( rewindState.rewind && rewindState.rewind.restoreId ) {
			this.props.getRewindRestoreProgress( siteId, rewindState.rewind.restoreId );
		}
	}

	initializeBreadcrumbs() {
		this.props.updateBreadcrumbs( [
			{
				label: this.props.translate( 'Activity Log' ),
				href: `/activity-log/${ this.props.slug || '' }`,
				id: 'activity-log',
			},
		] );
	}

	onScroll = () => {
		const y = window.scrollY;

		if ( ! this.state.scrollTicking ) {
			// It's best practice to throttle scroll event for performance
			window.requestAnimationFrame( () => {
				this.stickFilterBar( y );
				this.setState( { scrollTicking: false } );
			} );

			this.setState( { scrollTicking: true } );
		}
	};

	stickFilterBar = ( scrollY ) => {
		const { initialFilterBarY, masterBarHeight } = this.state;
		const filterBar = this.filterBarRef.current;

		if ( ! filterBar ) {
			return;
		}

		if ( ! initialFilterBarY ) {
			this.setState( { initialFilterBarY: filterBar.getBoundingClientRect().top } );
		}

		if ( ! masterBarHeight ) {
			const masterBar = document.querySelector( '.masterbar' );

			this.setState( { masterBarHeight: masterBar ? masterBar.clientHeight : 0 } );
		}

		filterBar.classList.toggle( 'is-sticky', scrollY + masterBarHeight >= initialFilterBarY );
	};

	/**
	 * Close Restore, Backup, or Transfer confirmation dialog.
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
	 * @param   {Object} date Moment to adjust.
	 * @returns {Object}      Moment adjusted for site timezone or gmtOffset.
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
	 * @returns {Object} Component showing progress.
	 */
	renderActionProgress() {
		const { siteId, restoreProgress, backupProgress, hideRewindProgress } = this.props;

		if ( ( ! restoreProgress && ! backupProgress ) || hideRewindProgress ) {
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
	 * @param   {number} siteId         Id of the site where the operation is performed.
	 * @param   {Object}  actionProgress Current status of operation performed.
	 * @param   {string}  action         Action type. Allows to set the right text without waiting for data.
	 * @returns {Object}                 Card showing progress.
	 */
	getProgressBanner( siteId, actionProgress, action ) {
		const { percent, progress, restoreId, downloadId, status, timestamp, rewindId, context } =
			actionProgress;
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
	 * @param   {number} siteId   Id of the site where the operation was performed.
	 * @param   {Object}  progress Last status of operation.
	 * @returns {Object}           Card showing success or error.
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
		const { rewindState, translate, hideRewindProgress } = this.props;

		if ( ! rewindState.rewind || rewindState.rewind.status !== 'failed' || hideRewindProgress ) {
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
		const {
			filter,
			displayRulesLoaded,
			logsLoaded,
			siteId,
			translate,
			hasFullActivityLog,
			slug,
			syncLoaded,
		} = this.props;

		const isFilterEmpty = isEqual( emptyFilter, filter );

		if ( displayRulesLoaded && logsLoaded && syncLoaded ) {
			return isFilterEmpty ? (
				<ActivityLogExample siteId={ siteId } siteIsOnFreePlan={ ! hasFullActivityLog } />
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
			allLogsVisible,
			moment,
			rewindState,
			siteId,
			hasFullActivityLog,
			translate,
			isAtomic,
			isJetpack,
			isIntroDismissed,
			isMultisite,
			areCredentialsInvalid,
		} = this.props;

		const disableRestore =
			! enableRewind ||
			[ 'queued', 'running' ].includes( get( this.props, [ 'restoreProgress', 'status' ] ) ) ||
			( ! isAtomic && areCredentialsInvalid ) ||
			'active' !== rewindState.state;
		const disableBackup = 0 <= get( this.props, [ 'backupProgress', 'progress' ], -Infinity );

		const pageCount = Math.ceil( logs.length / PAGE_SIZE );
		const actualPage = Math.max( 1, Math.min( requestedPage, pageCount ) );
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

		const showVisibleDaysLimitUpsell = ! allLogsVisible && actualPage >= pageCount;

		return (
			<>
				{ siteId && 'active' === rewindState.state && (
					<QueryRewindBackupStatus siteId={ siteId } />
				) }
				<QuerySiteSettings siteId={ siteId } />
				<QuerySiteFeatures siteIds={ [ siteId ] } />
				<QueryRewindBackups siteId={ siteId } />
				{ ! isAtomic && <QueryJetpackCredentialsStatus siteId={ siteId } role="main" /> }

				{ isJetpackCloud() && <SidebarNavigation /> }

				<NavigationHeader
					navigationItems={ [] }
					title={ translate( 'Activity' ) }
					subtitle={ translate(
						"Keep tabs on all your site's activity — plugin and theme updates, user logins, setting modifications, and more."
					) }
				/>

				{ siteId && isJetpack && ! isAtomic && <RewindAlerts siteId={ siteId } /> }
				{ siteId && 'unavailable' === rewindState.state && (
					<RewindUnavailabilityNotice siteId={ siteId } />
				) }
				<IntroBanner siteId={ siteId } />
				{ ! hasFullActivityLog && isIntroDismissed && ! isMultisite && (
					<UpgradeBanner siteId={ siteId } />
				) }
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
							className="activity-log__pagination is-top-pagination"
							key="activity-list-pagination-top"
							nextLabel={ translate( 'Older' ) }
							page={ actualPage }
							pageClick={ this.changePage }
							perPage={ PAGE_SIZE }
							prevLabel={ translate( 'Newer' ) }
							total={ logs.length }
						/>
						<section className="activity-log__wrapper">
							{ ! hasFullActivityLog && <div className="activity-log__fader" /> }
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
						{ showVisibleDaysLimitUpsell && (
							<VisibleDaysLimitUpsell cardClassName="activity-log-item__card" />
						) }
						{ ! hasFullActivityLog && ! isIntroDismissed && <UpgradeBanner siteId={ siteId } /> }
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
		const { siteId, filter, logs, hasFullActivityLog, displayRulesLoaded, logsLoaded } = this.props;
		const isFilterEmpty = isEqual( emptyFilter, filter );

		if ( ! hasFullActivityLog ) {
			return null;
		}

		return (
			<div className="activity-log__filterbar-ctn" ref={ this.filterBarRef }>
				<Filterbar
					siteId={ siteId }
					filter={ filter }
					isLoading={ ! displayRulesLoaded || ! logsLoaded }
					isVisible={ ! ( isEmpty( logs ) && isFilterEmpty ) }
					variant="compact"
				/>
			</div>
		);
	}

	render() {
		const { siteId, translate } = this.props;

		const { context, rewindState, siteSettingsUrl } = this.props;

		const rewindNoThanks = get( context, 'query.rewind-redirect', '' );
		const rewindIsNotReady =
			[ 'uninitialized', 'awaitingCredentials' ].includes( rewindState.state ) ||
			'vp_can_transfer' === rewindState.reason;

		return (
			<Main wideLayout>
				<QuerySiteFeatures siteIds={ [ siteId ] } />
				<PageViewTracker path="/activity-log/:site" title="Activity" />
				<DocumentHead title={ translate( 'Activity' ) } />
				{ siteId && <QueryRewindPolicies siteId={ siteId } /> }
				{ siteId && <QueryRewindState siteId={ siteId } /> }
				{ siteId && <QueryJetpackPlugins siteIds={ [ siteId ] } /> }
				{ siteId && <TimeMismatchWarning siteId={ siteId } settingsUrl={ siteSettingsUrl } /> }
				{ '' !== rewindNoThanks && rewindIsNotReady
					? siteId && <ActivityLogSwitch siteId={ siteId } redirect={ rewindNoThanks } />
					: this.getActivityLog() }
				<JetpackColophon />
			</Main>
		);
	}
}

const emptyList = [];

function filterLogEntries( allLogEntries, visibleDays, gmtOffset, timezone ) {
	if ( ! Number.isFinite( visibleDays ) ) {
		return allLogEntries;
	}

	const oldestVisibleDate = applySiteOffset( Date.now(), { gmtOffset, timezone } )
		.subtract( visibleDays, 'days' )
		.startOf( 'day' );

	// This could slightly degrade performance, but it's likely
	// this entire component tree gets refactored or removed soon,
	// in favor of calypso/my-sites/activity/activity-log-v2.
	return allLogEntries.filter( ( log ) => {
		const dateWithOffset = applySiteOffset( log.activityDate, { gmtOffset, timezone } );
		return dateWithOffset.isSameOrAfter( oldestVisibleDate, 'day' );
	} );
}

function withActivityLog( Inner ) {
	return ( props ) => {
		const { siteId, filter, gmtOffset, timezone } = props;
		const visibleDays = useSelector( ( state ) => getActivityLogVisibleDays( state, siteId ) );
		const { data, isSuccess } = useActivityLogQuery( siteId, filter );
		const allLogEntries = data ?? emptyList;
		const visibleLogEntries = filterLogEntries( allLogEntries, visibleDays, gmtOffset, timezone );
		const allLogsVisible = visibleLogEntries.length === allLogEntries.length;
		return (
			<Inner
				{ ...props }
				logs={ visibleLogEntries }
				logsLoaded={ isSuccess }
				allLogsVisible={ allLogsVisible }
			/>
		);
	};
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const gmtOffset = getSiteGmtOffset( state, siteId );
		const timezone = getSiteTimezoneValue( state, siteId );
		const requestedRestoreId = getRequestedRewind( state, siteId );
		const rewindBackups = getRewindBackups( state, siteId );
		const rewindState = getRewindState( state, siteId );
		const restoreStatus = rewindState.rewind && rewindState.rewind.status;
		const filter = getActivityLogFilter( state, siteId );

		const isJetpack = isJetpackSite( state, siteId );

		const displayRulesLoaded = getRewindPoliciesRequestStatus( state, siteId ) === 'success';

		return {
			gmtOffset,
			enableRewind:
				'active' === rewindState.state &&
				! ( 'queued' === restoreStatus || 'running' === restoreStatus ),
			filter,
			isAtomic: isAtomicSite( state, siteId ),
			isJetpack,
			displayRulesLoaded,
			requestedRestoreId,
			restoreProgress: getRestoreProgress( state, siteId ),
			backupProgress: getBackupProgress( state, siteId ),
			rewindBackups,
			rewindState,
			siteId,
			siteTitle: getSiteTitle( state, siteId ),
			siteSettingsUrl: getSettingsUrl( state, siteId, 'general' ),
			slug: getSiteSlug( state, siteId ),
			timezone,
			hasFullActivityLog: siteHasFeature( state, siteId, WPCOM_FEATURES_FULL_ACTIVITY_LOG ),
			isIntroDismissed: getPreference( state, 'dismissible-card-activity-introduction-banner' ),
			isMultisite: isJetpackSiteMultiSite( state, siteId ),
			areCredentialsInvalid: areJetpackCredentialsInvalid( state, siteId, 'main' ),
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
		updateBreadcrumbs,
	}
)( withSyncStatus( withActivityLog( localize( withLocalizedMoment( ActivityLog ) ) ) ) );
