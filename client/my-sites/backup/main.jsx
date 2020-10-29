/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { Component } from 'react';
import momentDate from 'moment';
import page from 'page';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import EnableRestoresBanner from './enable-restores-banner';
import { backupMainPath } from './paths';
import { isEnabled } from 'calypso/config';
import DocumentHead from 'calypso/components/data/document-head';
import { updateFilter, setFilter } from 'calypso/state/activity-log/actions';
import {
	getRawDailyBackupDeltas,
	getDailyBackupDeltas,
	// getMetaDiffForDailyBackup,
	isActivityBackup,
	isSuccessfulRealtimeBackup,
	isSuccessfulDailyBackup,
	INDEX_FORMAT,
} from 'calypso/lib/jetpack/backup-utils';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { requestActivityLogs } from 'calypso/state/data-getters';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import BackupPlaceholder from 'calypso/components/jetpack/backup-placeholder';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import BackupDelta from 'calypso/components/jetpack/backup-delta';
import DailyBackupStatus from 'calypso/components/jetpack/daily-backup-status';
import DailyBackupStatusAlternate from 'calypso/components/jetpack/daily-backup-status/index-alternate';
import BackupDatePicker from 'calypso/components/jetpack/backup-date-picker';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QueryRewindCapabilities from 'calypso/components/data/query-rewind-capabilities';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import getActivityLogFilter from 'calypso/state/selectors/get-activity-log-filter';
import ActivityCardList from 'calypso/components/activity-card-list';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import getSiteUrl from 'calypso/state/sites/selectors/get-site-url';
import getSettingsUrl from 'calypso/state/selectors/get-settings-url';
import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials.js';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import QuerySiteSettings from 'calypso/components/data/query-site-settings'; // Required to get site time offset
import getRewindCapabilities from 'calypso/state/selectors/get-rewind-capabilities';
import { emptyFilter } from 'calypso/state/activity-log/reducer';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import BackupCard from 'calypso/components/jetpack/backup-card';
import TimeMismatchWarning from 'calypso/blocks/time-mismatch-warning';

/**
 * Style dependencies
 */
import './style.scss';

class BackupsPage extends Component {
	componentDidMount() {
		const { queryDate, moment, clearFilter, siteId } = this.props;

		// filters in the global state are modified by other pages, we want to enter this page with the filter empty
		clearFilter( siteId );

		// On first load, check if we have a selected date from the URL
		if ( queryDate ) {
			this.onDateChange( moment( queryDate, INDEX_FORMAT ) );
		}
	}

	onDateChange = ( date ) => {
		const { siteSlug, moment, timezone, gmtOffset } = this.props;

		const today = applySiteOffset( moment(), { timezone, gmtOffset } );

		if ( date && date.isValid() && date <= today ) {
			// Valid dates
			page(
				backupMainPath( siteSlug, {
					date: date.format( INDEX_FORMAT ),
				} )
			);
		} else {
			// No query for invalid dates
			page( backupMainPath( siteSlug ) );
		}
	};

	getSelectedDate() {
		const { timezone, gmtOffset, moment, queryDate } = this.props;

		const today = applySiteOffset( moment(), {
			timezone: timezone,
			gmtOffset: gmtOffset,
		} );

		const selectedDate = moment( queryDate, INDEX_FORMAT );

		return ( selectedDate.isValid() && selectedDate ) || today;
	}

	/**
	 *  Return an object with the last backup and the rest of the activities from the selected date
	 */
	backupsFromSelectedDate = () => {
		const { moment, siteCapabilities } = this.props;

		const date = this.getSelectedDate();
		const index = moment( date ).format( INDEX_FORMAT );
		const hasRealtimeBackups = includes( siteCapabilities, 'backup-realtime' );

		const backupsOnSelectedDate = {
			lastBackup: null,
			rewindableActivities: [],
		};

		if ( index in this.props.indexedLog && this.props.indexedLog[ index ].length > 0 ) {
			this.props.indexedLog[ index ].forEach( ( log ) => {
				// Discard log if it's not activity rewindable, failed backup or with streams
				if (
					( ! hasRealtimeBackups && ! isActivityBackup( log ) ) ||
					( ! isActivityBackup( log ) && ! isSuccessfulRealtimeBackup( log ) )
				) {
					return;
				}

				// Looking for the last backup on the date (any activity rewindable)
				if ( ! backupsOnSelectedDate.lastBackup ) {
					backupsOnSelectedDate.lastBackup = log;
				} else if ( log ) {
					backupsOnSelectedDate.rewindableActivities.push( log );
				}
			} );
		}

		return backupsOnSelectedDate;
	};

	getLatestBackup() {
		const { logs, moment, siteCapabilities } = this.props;

		const filteredLogs = includes( siteCapabilities, 'backup-realtime' )
			? logs.filter( isSuccessfulRealtimeBackup )
			: logs.filter( ( log ) => log.activityIsRewindable );

		if ( filteredLogs.length > 0 ) {
			return filteredLogs.sort( ( l1, l2 ) =>
				moment( l1.activityDate ).isBefore( l2.activityDate )
			)[ 0 ];
		}
	}

	renderMain() {
		const { siteId, isLoadingBackups, translate } = this.props;

		return (
			<>
				<DocumentHead title={ translate( 'Latest backups' ) } />
				<PageViewTracker path="/backup/:site" title="Backups" />

				<QueryRewindState siteId={ siteId } />
				<QuerySitePurchases siteId={ siteId } />
				<QuerySiteSettings siteId={ siteId } />
				<QueryRewindCapabilities siteId={ siteId } />

				{ isLoadingBackups ? (
					<BackupPlaceholder />
				) : (
					<div className="backup__main-wrap">
						{ isEnabled( 'jetpack/backup-simplified-screens-i4' )
							? this.renderAlternateWrap()
							: this.renderWrap() }
					</div>
				) }
			</>
		);
	}

	renderWrap() {
		const {
			allowRestore,
			doesRewindNeedCredentials,
			siteCapabilities,
			logs,
			moment,
			siteSlug,
			lastSuccessDateAvailable,
			timezone,
			gmtOffset,
		} = this.props;

		const { lastBackup, rewindableActivities: realtimeBackups } = this.backupsFromSelectedDate();
		const selectedDateString = moment.parseZone( this.getSelectedDate() ).toISOString( true );
		const today = applySiteOffset( moment(), { timezone, gmtOffset } );
		const deltas = getDailyBackupDeltas( logs, selectedDateString );
		// todo: commented as a quick fix before Jetpack Cloud launch. All the non-english account break here.
		// See: 1169345694087188-as-1176670093007897
		// const metaDiff = getMetaDiffForDailyBackup( logs, selectedDateString );

		return (
			<>
				<div className="backup__last-backup-status">
					{ doesRewindNeedCredentials && <EnableRestoresBanner /> }
					{ this.renderDatePicker() }

					<DailyBackupStatus
						{ ...{
							selectedDate: this.getSelectedDate(),
							lastBackupDate: lastSuccessDateAvailable,
							backup: lastBackup,
							deltas,
							// metaDiff, todo: commented because the non-english account issue
						} }
					/>
				</div>

				{ includes( siteCapabilities, 'backup-realtime' ) && lastBackup && (
					<BackupDelta
						{ ...{
							deltas,
							realtimeBackups,
							doesRewindNeedCredentials,
							allowRestore,
							moment,
							siteSlug,
							isToday: today.isSame( this.getSelectedDate(), 'day' ),
						} }
					/>
				) }
			</>
		);
	}

	renderAlternateWrap() {
		const {
			siteCapabilities,
			logs,
			moment,
			lastSuccessDateAvailable,
			doesRewindNeedCredentials,
		} = this.props;

		const {
			lastBackup: backup,
			rewindableActivities: realtimeBackups,
		} = this.backupsFromSelectedDate();
		const selectedDateString = moment.parseZone( this.getSelectedDate() ).toISOString( true );
		const latestBackup = this.getLatestBackup();

		return (
			<>
				{ doesRewindNeedCredentials && <EnableRestoresBanner /> }
				{ this.renderDatePicker() }
				<ul className="backup__card-list">
					<li key="daily-backup-status">
						<DailyBackupStatusAlternate
							{ ...{
								selectedDate: this.getSelectedDate(),
								lastBackupDate: lastSuccessDateAvailable,
								backup,
								isLatestBackup:
									latestBackup && backup && latestBackup.activityId === backup.activityId,
								dailyDeltas: getRawDailyBackupDeltas( logs, selectedDateString ),
							} }
						/>
					</li>
					{ includes( siteCapabilities, 'backup-realtime' ) && backup && (
						<>
							{ realtimeBackups.map( ( activity ) => (
								<li key={ activity.activityId }>
									<BackupCard activity={ activity } />
								</li>
							) ) }
						</>
					) }
				</ul>
			</>
		);
	}

	renderDatePicker() {
		const {
			dispatchRecordTracksEvent,
			moment,
			siteId,
			siteSlug,
			oldestDateAvailable,
			timezone,
			gmtOffset,
		} = this.props;
		const today = applySiteOffset( moment(), { timezone, gmtOffset } );

		return (
			<BackupDatePicker
				{ ...{
					onDateChange: this.onDateChange,
					selectedDate: this.getSelectedDate(),
					siteId,
					oldestDateAvailable,
					today,
					siteSlug,
					dispatchRecordTracksEvent,
				} }
			/>
		);
	}

	renderBackupSearch() {
		const { logs, siteSlug, translate } = this.props;

		// Filter out anything that is not restorable
		const restorablePoints = logs.filter( ( event ) => !! event.activityIsRewindable );

		return (
			<div className="backup__search">
				<div className="backup__search-header">
					{ translate( 'Find a backup or restore point' ) }
				</div>
				<div className="backup__search-description">
					{ translate(
						'This is the complete event history for your site. Filter by date range and/ or activity type.'
					) }
				</div>
				<ActivityCardList logs={ restorablePoints } pageSize={ 10 } siteSlug={ siteSlug } />
			</div>
		);
	}

	renderContent() {
		const { isAdmin, isEmptyFilter, translate } = this.props;

		if ( ! isAdmin ) {
			return (
				<EmptyContent
					illustration="/calypso/images/illustrations/illustration-404.svg"
					title={ translate( 'You are not authorized to view this page' ) }
				/>
			);
		}

		return isEmptyFilter ? this.renderMain() : this.renderBackupSearch();
	}

	render() {
		return (
			<div
				className={ classNames( 'backup__page', {
					wordpressdotcom: ! isJetpackCloud(),
				} ) }
			>
				<Main
					className={ classNames( {
						is_jetpackcom: isJetpackCloud(),
					} ) }
				>
					<SidebarNavigation />
					<TimeMismatchWarning
						siteId={ this.props.siteId }
						settingsUrl={ this.props.settingsUrl }
					/>
					{ ! isJetpackCloud() && (
						<FormattedHeader headerText="Jetpack Backup" align="left" brandFont />
					) }
					{ this.renderContent() }
				</Main>
			</div>
		);
	}
}

/**
 * Create an indexed log of backups based on the date of the backup and in the site time zone
 *
 * @param {Array} logs The activity logs retrieved from the store
 * @param {string} timezone The site time zone
 * @param {number} gmtOffset The site offset from the GMT
 */
const createIndexedLog = ( logs, timezone, gmtOffset ) => {
	const indexedLog = {};
	let oldestDateAvailable = applySiteOffset( momentDate(), {
		timezone,
		gmtOffset,
	} );
	let lastDateAvailable = null;
	let lastSuccessDateAvailable = null;

	if ( 'success' === logs.state ) {
		logs.data.forEach( ( log ) => {
			//Move the backup date to the site timezone
			const backupDate = applySiteOffset( momentDate( log.activityTs ), {
				timezone,
				gmtOffset,
			} );

			//Get the index for this backup, index format: YYYYMMDD
			const index = backupDate.format( INDEX_FORMAT );

			if ( ! ( index in indexedLog ) ) {
				//The first time we create the index for this date
				indexedLog[ index ] = [];
			}

			// Check for the oldest and the last backup dates
			if ( isActivityBackup( log ) || log.activityIsRewindable ) {
				if ( backupDate < oldestDateAvailable ) {
					oldestDateAvailable = backupDate;
				}
				if ( backupDate > lastDateAvailable ) {
					lastDateAvailable = backupDate;
				}
				if ( backupDate > lastSuccessDateAvailable && isSuccessfulDailyBackup( log ) ) {
					lastSuccessDateAvailable = backupDate;
				}
			}

			indexedLog[ index ].push( log );
		} );
	}

	return {
		indexedLog,
		oldestDateAvailable,
		lastDateAvailable,
		lastSuccessDateAvailable,
	};
};

const getIsEmptyFilter = ( filter ) => {
	if ( ! filter ) {
		return true;
	}
	if ( filter.group || filter.on || filter.before || filter.after ) {
		return false;
	}
	if ( filter.page !== 1 ) {
		return false;
	}
	return true;
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const filter = getActivityLogFilter( state, siteId );
	const logs = requestActivityLogs( siteId, filter );
	const gmtOffset = getSiteGmtOffset( state, siteId );
	const timezone = getSiteTimezoneValue( state, siteId );
	const rewind = getRewindState( state, siteId );
	const restoreStatus = rewind.rewind && rewind.rewind.status;
	const doesRewindNeedCredentials = getDoesRewindNeedCredentials( state, siteId );
	const siteCapabilities = getRewindCapabilities( state, siteId );

	const allowRestore =
		'active' === rewind.state && ! ( 'queued' === restoreStatus || 'running' === restoreStatus );

	const { indexedLog, oldestDateAvailable, lastSuccessDateAvailable } = createIndexedLog(
		logs,
		timezone,
		gmtOffset
	);

	const isLoadingBackups = ! ( logs.state === 'success' );

	return {
		allowRestore,
		doesRewindNeedCredentials,
		filter,
		isAdmin: canCurrentUser( state, siteId, 'manage_options' ),
		isEmptyFilter: getIsEmptyFilter( filter ),
		siteCapabilities,
		logs: logs?.data ?? [],
		rewind,
		siteId,
		siteUrl: getSiteUrl( state, siteId ),
		siteSlug: getSelectedSiteSlug( state ),
		settingsUrl: getSettingsUrl( state, siteId, 'general' ),
		timezone,
		gmtOffset,
		indexedLog,
		oldestDateAvailable,
		lastSuccessDateAvailable,
		isLoadingBackups,
	};
};

const mapDispatchToProps = ( dispatch ) => ( {
	selectPage: ( siteId, pageNumber ) => dispatch( updateFilter( siteId, { page: pageNumber } ) ),
	clearFilter: ( siteId ) =>
		// skipUrlUpdate prevents this action from trigger a redirect back to backups/activity in state/navigation/middleware.js
		dispatch( { ...setFilter( siteId, emptyFilter ), meta: { skipUrlUpdate: true } } ),
	dispatchRecordTracksEvent: recordTracksEvent,
} );

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( withLocalizedMoment( BackupsPage ) ) );
