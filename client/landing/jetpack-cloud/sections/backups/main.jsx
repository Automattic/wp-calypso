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
import ActivityList from '../../components/activity-list';
import DatePicker from '../../components/date-picker';
import DailyBackupStatus from '../../components/daily-backup-status';
import { getBackupAttemptsForDate } from './utils';

class BackupsPage extends Component {
	state = {
		currentDateSetting: false,
	};

	dateChange = currentDateSetting => this.setState( { currentDateSetting } );

	render() {
		const { logs, siteId } = this.props;
		const initialDate = new Date();
		const currentDateSetting = this.state.currentDateSetting
			? this.state.currentDateSetting
			: new Date().toISOString().split( 'T' )[ 0 ];

		const backupAttempts = getBackupAttemptsForDate( logs, currentDateSetting );

		return (
			<div>
				<DatePicker siteId={ siteId } initialDate={ initialDate } onChange={ this.dateChange } />
				<DailyBackupStatus date={ currentDateSetting } backupAttempts={ backupAttempts } />
				<ActivityList logs={ this.props.logs } />
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const logs = siteId && requestActivityLogs( siteId, { group: 'rewind' } );

	return {
		siteId,
		logs: logs?.data ?? [],
	};
} )( BackupsPage );
