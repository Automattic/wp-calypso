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
		console.log( fromDate, toDate );
	};

	componentWillMount() {}

	render() {
		const { logs, siteId } = this.props;

		const backupPoints = logs.filter( activity => {
			return activity.activityIsRewindable === true;
		} );

		console.log( this.props.activityLogFilter );

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
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const logs = siteId && requestActivityLogs( siteId, { group: 'rewind' } );

	return {
		siteId,
		logs: [],
		activityLogFilter: getActivityLogFilter( state, siteId ),
	};
} )( BackupsPage );
