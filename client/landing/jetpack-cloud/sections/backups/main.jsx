/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { isMobile } from '@automattic/viewport';
import page from 'page';
import React, { Component } from 'react';
import momentDate from 'moment';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import { updateFilter } from 'state/activity-log/actions';
import {
	getBackupAttemptsForDate,
	getDailyBackupDeltas,
	getEventsInDailyBackup,
	getMetaDiffForDailyBackup,
} from './utils';
import { getSelectedSiteId } from 'state/ui/selectors';
import { requestActivityLogs } from 'state/data-getters';
import { withLocalizedMoment } from 'components/localized-moment';
import BackupDelta from '../../components/backup-delta';
import DailyBackupStatus from '../../components/daily-backup-status';
import DatePicker from '../../components/date-picker';
import getRewindState from 'state/selectors/get-rewind-state';
import getSelectedSiteSlug from 'state/ui/selectors/get-selected-site-slug';
import QueryRewindState from 'components/data/query-rewind-state';
import QuerySitePurchases from 'components/data/query-site-purchases';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import getActivityLogFilter from 'state/selectors/get-activity-log-filter';
import Filterbar from 'my-sites/activity/filterbar';
import ActivityCard from '../../components/activity-card';
import siteSupportsRealtimeBackup from 'state/selectors/site-supports-realtime-backup';
import Pagination from 'components/pagination';
import MissingCredentialsWarning from '../../components/missing-credentials';
import getDoesRewindNeedCredentials from 'state/selectors/get-does-rewind-need-credentials.js';
import getSiteGmtOffset from 'state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'state/selectors/get-site-timezone-value';
import { applySiteOffset } from 'lib/site/timezone';
import QuerySiteSettings from 'components/data/query-site-settings'; // Required to get site time offset

/**
 * Style dependencies
 */
import './style.scss';

const PAGE_SIZE = 10;
const INDEX_FORMAT = 'YYYYMMDD';

const backupStatusNames = [
	'rewind__backup_complete_full',
	'rewind__backup_complete_initial',
	'rewind__backup_error',
];

class BackupsPage extends Component {
	state = this.getDefaultState();

	getDefaultState() {
		return {
			selectedDate: new Date(),
			backupsOnSelectedDate: {
				lastBackup: null,
				activities: [],
				nextBackupAt: null,
			},
		};
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.siteId !== this.props.siteId ) {
			//If we switch the site, reset the current state to default
			this.resetState();
		}
		if ( prevProps.isLoadingBackups && ! this.props.isLoadingBackups ) {
			const today = applySiteOffset( momentDate(), {
				timezone: this.props.siteTimezone,
				gmtOffset: this.props.gmtOffset,
			} );

			this.setBackupLogsFor( today );
		}
	}

	resetState() {
		this.setState( this.getDefaultState() );
	}

	onDateChange = date => {
		this.setState( { selectedDate: date } );
		this.setBackupLogsFor( date );
	};

	/**
	 *  Create a list of backups in the selected date
	 *
	 * @param date {Date} The current selected date
	 */
	setBackupLogsFor = date => {
		const { moment } = this.props;

		const index = moment( date ).format( INDEX_FORMAT );

		const backupsOnSelectedDate = {
			lastBackup: null,
			activities: [],
		};

		if ( index in this.props.indexedLog && this.props.indexedLog[ index ].length > 0 ) {
			this.props.indexedLog[ index ].forEach( log => {
				// Looking for the last backup on the date
				if (
					! backupsOnSelectedDate.lastBackup &&
					backupStatusNames.includes( log.activityName )
				) {
					backupsOnSelectedDate.lastBackup = log;
				} else {
					backupsOnSelectedDate.activities.push( log );
				}
			} );
		}

		this.setState( { backupsOnSelectedDate } );
	};

	isEmptyFilter = filter => {
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

	TO_REMOVE_getSelectedDateString = () => {
		const { moment } = this.props;
		const { selectedDate } = this.state;
		return moment.parseZone( selectedDate ).toISOString( true );
	};

	renderMain() {
		const {
			allowRestore,
			doesRewindNeedCredentials,
			hasRealtimeBackups,
			logs,
			moment,
			siteId,
			siteSlug,
			isLoadingBackups,
			oldestDateAvailable,
			siteTimezone,
			siteGmtOffset,
		} = this.props;
		const { selectedDate, backupsOnSelectedDate } = this.state;

		const selectedDateString = this.TO_REMOVE_getSelectedDateString();

		const backupAttempts = getBackupAttemptsForDate( logs, selectedDateString );
		const deltas = getDailyBackupDeltas( logs, selectedDateString );
		const realtimeEvents = getEventsInDailyBackup( logs, selectedDateString );
		const metaDiff = getMetaDiffForDailyBackup( logs, selectedDateString );

		return (
			<Main>
				<DocumentHead title="Backups" />
				<SidebarNavigation />
				<QueryRewindState siteId={ siteId } />
				<QuerySitePurchases siteId={ siteId } />
				<QuerySiteSettings siteId={ siteId } />

				<DatePicker
					onDateChange={ this.onDateChange }
					selectedDate={ selectedDate }
					siteId={ siteId }
					oldestDateAvailable={ oldestDateAvailable }
				/>

				<div>{ isLoadingBackups && 'Loading backups...' }</div>

				{ ! isLoadingBackups && (
					<>
						<DailyBackupStatus
							allowRestore={ allowRestore }
							siteSlug={ siteSlug }
							backup={ backupsOnSelectedDate.lastBackup }
							timezone={ siteTimezone }
							gmtOffset={ siteGmtOffset }
						/>
						{ doesRewindNeedCredentials && (
							<MissingCredentialsWarning settingsLink={ `/settings/${ siteSlug }` } />
						) }
						<BackupDelta
							{ ...{
								deltas,
								backupAttempts,
								hasRealtimeBackups,
								realtimeEvents,
								allowRestore,
								moment,
								siteSlug,
								metaDiff,
							} }
						/>
					</>
				) }
			</Main>
		);
	}

	changePage = pageNumber => {
		this.props.selectPage( this.props.siteId, pageNumber );
		window.scrollTo( 0, 0 );
	};

	renderActivityLog() {
		const { allowRestore, filter, logs, moment, siteId } = this.props;
		const { page: requestedPage } = filter;

		const actualPage = Math.max(
			1,
			Math.min( requestedPage, Math.ceil( logs.length / PAGE_SIZE ) )
		);
		const theseLogs = logs.slice( ( actualPage - 1 ) * PAGE_SIZE, actualPage * PAGE_SIZE );

		const cards = theseLogs.map( activity => (
			<ActivityCard
				{ ...{
					key: activity.activityId,
					moment,
					activity,
					allowRestore,
				} }
			/>
		) );

		return (
			<div>
				<div>Find a backup or restore point</div>
				<div>
					This is the complete event history for your site. Filter by date range and/ or activity
					type.
				</div>
				<Filterbar
					{ ...{
						siteId,
						filter,
						isLoading: false,
						isVisible: true,
					} }
				/>
				<Pagination
					compact={ isMobile() }
					className="backups__pagination"
					key="backups__pagination-top"
					nextLabel={ 'Older' }
					page={ actualPage }
					pageClick={ this.changePage }
					perPage={ PAGE_SIZE }
					prevLabel={ 'Newer' }
					total={ logs.length }
				/>
				{ cards }
				<Pagination
					compact={ isMobile() }
					className="backups__pagination"
					key="backups__pagination-bottom"
					nextLabel={ 'Older' }
					page={ actualPage }
					pageClick={ this.changePage }
					perPage={ PAGE_SIZE }
					prevLabel={ 'Newer' }
					total={ logs.length }
				/>
			</div>
		);
	}

	render() {
		const { filter } = this.props;

		return (
			<div className="backups__page">
				{ ! this.isEmptyFilter( filter ) ? this.renderActivityLog() : this.renderMain() }
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
	let oldestDateAvailable = new Date();

	if ( 'success' === logs.state ) {
		logs.data.forEach( log => {
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

				//Check if the backup date is the oldest
				if ( backupDate < oldestDateAvailable ) {
					oldestDateAvailable = backupDate.toDate();
				}
			}

			indexedLog[ index ].push( log );
		} );
	}

	return {
		indexedLog,
		oldestDateAvailable,
	};
};

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );

	//The section require a valid site, if not, redirect to backups
	if ( false === !! siteId ) {
		return page.redirect( '/backups' );
	}

	const filter = getActivityLogFilter( state, siteId );
	const logs = requestActivityLogs( siteId, filter );
	const siteGmtOffset = getSiteGmtOffset( state, siteId );
	const siteTimezone = getSiteTimezoneValue( state, siteId );
	const rewind = getRewindState( state, siteId );
	const restoreStatus = rewind.rewind && rewind.rewind.status;
	const doesRewindNeedCredentials = getDoesRewindNeedCredentials( state, siteId );
	const hasRealtimeBackups = siteSupportsRealtimeBackup( state, siteId );
	const allowRestore =
		'active' === rewind.state && ! ( 'queued' === restoreStatus || 'running' === restoreStatus );

	const { indexedLog, oldestDateAvailable } = createIndexedLog( logs, siteTimezone, siteGmtOffset );

	const isLoadingBackups = ! ( logs.state === 'success' );

	return {
		allowRestore,
		doesRewindNeedCredentials,
		filter,
		hasRealtimeBackups,
		logs: logs?.data ?? [],
		rewind,
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		siteTimezone,
		siteGmtOffset,
		indexedLog,
		oldestDateAvailable,
		isLoadingBackups,
	};
};

const mapDispatchToProps = dispatch => ( {
	selectPage: ( siteId, pageNumber ) => dispatch( updateFilter( siteId, { page: pageNumber } ) ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( withLocalizedMoment( BackupsPage ) );
