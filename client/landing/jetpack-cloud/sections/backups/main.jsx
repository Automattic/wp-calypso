/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import DateRangeSelector from 'my-sites/activity/filterbar/date-range-selector';
import { requestActivityLogs } from 'state/data-getters';
import getActivityLogFilter from 'state/selectors/get-activity-log-filter';

class BackupsPage extends Component {
	selectDateRange = ( siteId, fromDate, toDate ) => {
		// eslint-disable-next-line no-console
		console.log( fromDate, toDate );
	};

	render() {
		const { logs, siteId } = this.props;

		return (
			<div>
				<div>Welcome to the backup detail page for site { this.props.siteId }</div>
				<DateRangeSelector
					isVisible={ true }
					onButtonClick={ null }
					onClose={ null }
					siteId={ siteId }
					selectDateRange={ this.selectDateRange }
				/>
				<p>There are { logs.length } log entries.</p>
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const filter = getActivityLogFilter( state, siteId );
	filter.group = 'rewind';
	const rawLogs = siteId && requestActivityLogs( siteId, filter );

	let logs = rawLogs?.data ?? [];

	// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
	logs = logs.filter( activity => activity.activityIsRewindable === true );

	return {
		siteId,
		logs,
		filter,
	};
} )( BackupsPage );
