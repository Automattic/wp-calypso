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
import DailyBackupStatus from '../../components/daily-backup-status';
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
	//todo: add the rest of the expected propTypes
	static propTypes = {
		logs: PropTypes.object,
		loading: PropTypes.bool,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		siteTimezone: PropTypes.string,
		siteGmtOffset: PropTypes.number,
	};

	state = {
		selectedDate: new Date(),
		backupsOnSelectedDate: [],
		indexedLog: {},
		oldestDateAvailable: new Date(),
	};

	componentDidMount() {
		this.createIndexedLog();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.logs !== this.props.logs ) {
			this.createIndexedLog();
		}
		if ( prevProps.siteId !== this.props.siteId ) {
			this.resetState();
		}
	}

	resetState() {
		this.setState( {
			selectedDate: new Date(),
			backupsOnSelectedDate: [],
			indexedLog: {},
			oldestDateAvailable: new Date(),
		} );
	}

	/**
	 * Create an indexed log of backups based on the date of the backup and in the site time zone
	 */
	createIndexedLog() {
		if ( 'success' === this.props.logs.state ) {
			const { siteTimezone, siteGmtOffset } = this.props;

			const indexedLog = {};
			let oldestDateAvailable = new Date();

			this.props.logs.data.forEach( log => {
				const backupDate = applySiteOffset( moment( log.activityTs ), {
					siteTimezone,
					siteGmtOffset,
				} );

				const index = backupDate.format( INDEX_FORMAT );

				if ( ! ( index in indexedLog ) ) {
					indexedLog[ index ] = [];

					if ( backupDate < oldestDateAvailable ) {
						oldestDateAvailable = backupDate.toDate();
					}
				}
				indexedLog[ index ].push( log );
			} );

			this.setState( {
				indexedLog,
				oldestDateAvailable,
			} );
		}
	}

	onDateChange = date => {
		this.setState( { selectedDate: date } );
		this.setBackupLogsFor( date );
	};

	setBackupLogsFor = date => {
		const index = moment( date ).format( INDEX_FORMAT );

		let backupsOnSelectedDate;

		if ( ! ( index in this.state.indexedLog ) || this.state.indexedLog[ index ].length === 0 ) {
			backupsOnSelectedDate = [];
		} else {
			backupsOnSelectedDate = this.state.indexedLog[ index ].filter( log =>
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
		const { siteId, siteSlug, loading, siteGmtOffset, siteTimezone } = this.props;

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
					oldestDateAvailable={ this.state.oldestDateAvailable }
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

				<DailyBackupStatus
					selectedDate={ this.state.selectedDate }
					backups={ this.state.backupsOnSelectedDate }
					siteSlug={ siteSlug }
					siteGmtOffset={ siteGmtOffset }
					siteTimezone={ siteTimezone }
				/>

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

	return {
		allowRestore,
		logs,
		loading,
		// rewind,
		siteId,
		sitePurchases,
		siteSlug,
		siteTimezone,
		siteGmtOffset,
	};
} )( withLocalizedMoment( BackupsPage ) );
