/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { requestActivityLogs } from 'state/data-getters';
import DatePicker from '../../components/date-picker';
import DailyBackupStatus from '../../components/daily-backup-status';
import { getBackupAttemptsForDate, getDailyBackupDeltas } from './utils';
import { getSitePurchases } from 'state/purchases/selectors';
import QuerySitePurchases from 'components/data/query-site-purchases';
import BackupDelta from '../../components/backup-delta';
import { emptyFilter } from 'state/activity-log/reducer';
import { withLocalizedMoment } from 'components/localized-moment';

class BackupsPage extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			selectedDateString: props.moment().toISOString( true ),
		};
	}

	dateChange = selectedDateString => this.setState( { selectedDateString } );

	hasRealtimeBackups = () =>
		!! this.props.sitePurchases.filter(
			purchase => 'jetpack_backup_realtime' === purchase.productSlug
		).length;

	render() {
		const { logs, siteId } = this.props;
		const { selectedDateString } = this.state;

		const hasRealtimeBackups = this.hasRealtimeBackups();

		const backupAttempts = getBackupAttemptsForDate( logs, selectedDateString );
		const deltas = getDailyBackupDeltas( logs, selectedDateString );

		return (
			<div>
				<QuerySitePurchases siteId={ siteId } />
				<DatePicker
					onChange={ this.dateChange }
					selectedDateString={ selectedDateString }
					siteId={ siteId }
				/>
				<DailyBackupStatus
					backupAttempts={ backupAttempts }
					selectedDateString={ selectedDateString }
				/>
				<BackupDelta deltas={ deltas } backupAttempts={ backupAttempts } />
				{ hasRealtimeBackups && <div>Real time backup points here</div> }
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const logs = siteId && requestActivityLogs( siteId, emptyFilter );
	const sitePurchases = siteId && getSitePurchases( state, siteId );

	return {
		sitePurchases,
		siteId,
		logs: logs?.data ?? [],
	};
} )( withLocalizedMoment( BackupsPage ) );
