/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { emptyFilter } from 'state/activity-log/reducer';
import { getBackupAttemptsForDate, getDailyBackupDeltas } from './utils';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePurchases } from 'state/purchases/selectors';
import { requestActivityLogs } from 'state/data-getters';
import { withLocalizedMoment } from 'components/localized-moment';
import BackupDelta from '../../components/backup-delta';
import DailyBackupStatus from '../../components/daily-backup-status';
import DatePicker from '../../components/date-picker';
import getRewindState from 'state/selectors/get-rewind-state';
import getSelectedSiteSlug from 'state/ui/selectors/get-selected-site-slug';
import QueryRewindState from 'components/data/query-rewind-state';
import QuerySitePurchases from 'components/data/query-site-purchases';

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
		const { allowRestore, logs, siteId, siteSlug } = this.props;
		const { selectedDateString } = this.state;

		const hasRealtimeBackups = this.hasRealtimeBackups();
		const backupAttempts = getBackupAttemptsForDate( logs, selectedDateString );
		const deltas = getDailyBackupDeltas( logs, selectedDateString );

		return (
			<div>
				<QueryRewindState siteId={ siteId } />
				<QuerySitePurchases siteId={ siteId } />
				<DatePicker
					onChange={ this.dateChange }
					selectedDateString={ selectedDateString }
					siteId={ siteId }
				/>
				<DailyBackupStatus
					allowRestore={ allowRestore }
					date={ selectedDateString }
					backupAttempts={ backupAttempts }
					siteSlug={ siteSlug }
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
	const rewind = getRewindState( state, siteId );
	const sitePurchases = siteId && getSitePurchases( state, siteId );

	const restoreStatus = rewind.rewind && rewind.rewind.status;
	const allowRestore =
		'active' === rewind.state && ! ( 'queued' === restoreStatus || 'running' === restoreStatus );

	return {
		allowRestore,
		logs: logs?.data ?? [],
		rewind,
		siteId,
		sitePurchases,
		siteSlug: getSelectedSiteSlug( state ),
	};
} )( withLocalizedMoment( BackupsPage ) );
