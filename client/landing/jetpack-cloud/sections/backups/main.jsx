/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { emptyFilter } from 'state/activity-log/reducer';
// import { getBackupAttemptsForDate, getDailyBackupDeltas, getEventsInDailyBackup } from './utils';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePurchases } from 'state/purchases/selectors';
import getSiteGmtOffset from 'state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'state/selectors/get-site-timezone-value';
import { applySiteOffset } from 'lib/site/timezone';
import { requestActivityLogs } from 'state/data-getters';
import { withLocalizedMoment } from 'components/localized-moment';
//import BackupDelta from '../../components/backup-delta';
//import DailyBackupStatus from '../../components/daily-backup-status';
import DatePicker from '../../components/date-picker';
import getRewindState from 'state/selectors/get-rewind-state';
import getSelectedSiteSlug from 'state/ui/selectors/get-selected-site-slug';
import QueryRewindState from 'components/data/query-rewind-state';
import QuerySitePurchases from 'components/data/query-site-purchases';
import QuerySiteSettings from 'components/data/query-site-settings'; // Required to get site time offset

const INDEX_FORMAT = 'YYYYMMDD';

const backupActivityNames = [
	'rewind__backup_complete_full',
	'rewind__backup_complete_initial',
	'rewind__backup_error',
];

class BackupsPage extends Component {
	static propTypes = {
		indexedLog: PropTypes.object,
		oldestDateAvailable: PropTypes.instanceOf( Date ),
		loading: PropTypes.bool,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		siteTimezone: PropTypes.string,
		siteGmtOffset: PropTypes.number,
	};

	state = {
		selectedDate: new Date(),
		backupsOnSelectedDate: [],
	};

	componentDidUpdate( prevProps ) {
		if ( prevProps.siteId !== this.props.siteId ) {
			//If we switch the site, reset the current state
			this.resetState();
		}
	}

	resetState() {
		this.setState( {
			selectedDate: new Date(),
			backupsOnSelectedDate: [],
		} );
	}

	onDateChange = date => {
		this.setState( { selectedDate: date } );
		this.setBackupLogsFor( date );
	};

	setBackupLogsFor = date => {
		const index = moment( date ).format( INDEX_FORMAT );

		let backupsOnSelectedDate;

		if ( ! ( index in this.props.indexedLog ) || this.props.indexedLog[ index ].length === 0 ) {
			backupsOnSelectedDate = [];
		} else {
			backupsOnSelectedDate = this.props.indexedLog[ index ].filter( log =>
				backupActivityNames.includes( log.activityName )
			);
		}

		this.setState( { backupsOnSelectedDate } );
	};

	onDateRangeSelection = () => {
		//todo: go to the log activity view
	};

	// hasRealtimeBackups = () =>
	// 	this.props.sitePurchases &&
	// 	!! this.props.sitePurchases.filter(
	// 		purchase => 'jetpack_backup_realtime' === purchase.productSlug
	// 	).length;

	render() {
		// const { allowRestore, logs, moment, siteId, siteSlug } = this.props;
		const { siteId, loading, oldestDateAvailable } = this.props;

		// const hasRealtimeBackups = this.hasRealtimeBackups();
		// const backupAttempts = getBackupAttemptsForDate( logs, selectedDateString );
		// const deltas = getDailyBackupDeltas( logs, selectedDateString );
		// const realtimeEvents = getEventsInDailyBackup( logs, selectedDateString );

		return (
			<div>
				<QuerySiteSettings siteId={ siteId } />
				<QueryRewindState siteId={ siteId } />
				<QuerySitePurchases siteId={ siteId } />

				<DatePicker
					onDateChange={ this.onDateChange }
					onDateRangeSelection={ this.onDateRangeSelection }
					selectedDate={ this.state.selectedDate }
					oldestDateAvailable={ oldestDateAvailable }
					siteId={ siteId }
				/>

				{ /* The following code is for testing purposes: */ }
				<div>{ loading && 'Loading backups...' }</div>
				<div>
					{ ! loading && 'Backups on this date: ' + this.state.backupsOnSelectedDate.length }
				</div>
				<ul>
					{ ! loading &&
						this.state.backupsOnSelectedDate.map( log => (
							<li key={ log.activityId }>{ log.activityTitle }</li>
						) ) }
				</ul>

				{ /*<DailyBackupStatus*/ }
				{ /*allowRestore={ allowRestore }*/ }
				{ /*date={ this.state.selectedDate }*/ }
				{ /*backups={ this.state.selectedDateBackups }*/ }
				{ /*backupAttempts={ backupAttempts }*/ }
				{ /*siteSlug={ siteSlug }*/ }
				{ /*/>*/ }

				{ /* Temporaly commented. PR in progress */ }
				{ /*<BackupDelta*/ }
				{ /*{ ...{*/ }
				{ /*deltas,*/ }
				{ /*backupAttempts,*/ }
				{ /*hasRealtimeBackups,*/ }
				{ /*realtimeEvents,*/ }
				{ /*allowRestore,*/ }
				{ /*moment,*/ }
				{ /*} }*/ }
				{ /*/>*/ }
			</div>
		);
	}
}

/**
 * Create an indexed log of backups based on the date of the backup and in the site time zone
 *
 * @param {Array} logs The activity logs retrieved from the store
 * @param {string} siteTimezone The site time zone
 * @param {number} siteGmtOffset The site offset from the GMT
 */
const createIndexedLog = ( logs, siteTimezone, siteGmtOffset ) => {
	const indexedLog = {};
	let oldestDateAvailable = new Date();

	if ( 'success' === logs.state ) {
		logs.data.forEach( log => {
			//Move the backup date to the site timezone
			const backupDate = applySiteOffset( moment( log.activityTs ), {
				siteTimezone,
				siteGmtOffset,
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

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );
	const siteGmtOffset = getSiteGmtOffset( state, siteId );
	const siteTimezone = getSiteTimezoneValue( state, siteId );
	const logs = requestActivityLogs( siteId, emptyFilter );
	const rewind = getRewindState( state, siteId );
	const sitePurchases = getSitePurchases( state, siteId );

	const restoreStatus = rewind.rewind && rewind.rewind.status;
	const allowRestore =
		'active' === rewind.state && ! ( 'queued' === restoreStatus || 'running' === restoreStatus );
	const loading = ! ( logs.state === 'success' );

	const { indexedLog, oldestDateAvailable } = createIndexedLog( logs, siteTimezone, siteGmtOffset );

	return {
		allowRestore,
		loading,
		// rewind,
		siteId,
		sitePurchases,
		siteSlug,
		siteTimezone,
		siteGmtOffset,
		indexedLog,
		oldestDateAvailable,
	};
} )( withLocalizedMoment( BackupsPage ) );
