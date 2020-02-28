/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
// import { getSelectedSiteId } from 'state/ui/selectors';
import { requestActivityLogs } from 'state/data-getters';
import getActivityLogFilter from 'state/selectors/get-activity-log-filter';
import BackupDateSelector from './backup-date-selector';
import ActivityLogItem from 'my-sites/activity/activity-log-item';

class BackupsPage extends Component {
	state = {
		currentDateSetting: false,
	};

	onDateChange = newDate => {
		this.setState( { currentDateSetting: newDate } );
	};

	getDateActivities = () => {
		const { logs } = this.props;
		const targetDate = new Date( this.state.currentDateSetting );

		return logs.filter( entry => {
			const activityDate = new Date( entry.activityDate );

			if (
				targetDate.getFullYear() === activityDate.getFullYear() &&
				targetDate.getMonth() === activityDate.getMonth() &&
				targetDate.getDate() === activityDate.getDate()
			) {
				return true;
			}
		} );
	};

	getContentInBackup = () => {
		const { siteId } = this.props;
		const allActivities = this.getDateActivities();

		return allActivities.map( activity => {
			return (
				<ActivityLogItem
					key={ activity.activityId }
					activity={ activity }
					disableRestore={ false }
					disableBackup={ false }
					siteId={ siteId }
				/>
			);
		} );
	};

	render() {
		const { logs, siteId } = this.props;

		const entries = this.getDateActivities();
		const mainBackup = entries.filter( entry => {
			return 'rewind__backup_complete_full' === entry.activityName;
		} );

		// eslint-disable-next-line no-console
		console.log( logs );

		const dateHasMainBackup = mainBackup.length > 0;

		return (
			<div>
				<div>Welcome to the backup detail page for site { this.props.siteId }</div>
				<BackupDateSelector siteId={ siteId } onDateChange={ this.onDateChange } />
				{ dateHasMainBackup && <div>Backup complete</div> }
				{ ! dateHasMainBackup && <div>Backup attempt failed</div> }
				{ dateHasMainBackup && <div>Content in backup: { this.getContentInBackup() }</div> }
			</div>
		);
	}
}

export default connect( state => {
	const siteId = 173369839; //getSelectedSiteId( state );
	const filter = getActivityLogFilter( state, siteId );
	//filter.group = 'rewind';
	const rawLogs = siteId && requestActivityLogs( siteId, filter );

	// eslint-disable-next-line prefer-const
	let logs = rawLogs?.data ?? [];

	// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
	//logs = logs.filter( activity => activity.activityIsRewindable === true );

	return {
		siteId,
		logs,
		filter,
	};
} )( BackupsPage );
