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

class BackupsPage extends Component {
	state = {
		currentDateSetting: new Date(),
	};

	dateChange = currentDateSetting => this.setState( { currentDateSetting } );

	hasRealtimeBackups = () =>
		!! this.props.sitePurchases.filter(
			purchase => 'jetpack_backup_realtime' === purchase.productSlug
		).length;

	render() {
		const { logs, siteId } = this.props;
		const { currentDateSetting } = this.state;

		const hasRealtimeBackups = this.hasRealtimeBackups();

		const backupAttempts = getBackupAttemptsForDate( logs, currentDateSetting );
		const deltas = getDailyBackupDeltas( logs, currentDateSetting );

		return (
			<div>
				<QuerySitePurchases siteId={ siteId } />
				<DatePicker siteId={ siteId } date={ currentDateSetting } onChange={ this.dateChange } />

				<DailyBackupStatus date={ currentDateSetting } backupAttempts={ backupAttempts } />
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
} )( BackupsPage );
