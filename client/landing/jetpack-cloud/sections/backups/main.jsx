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

class BackupsPage extends Component {
	state = {
		currentDateSetting: false,
	};

	dateChange = currentDateSetting => this.setState( { currentDateSetting } );

	render() {
		const { siteId } = this.props;
		const initialDate = new Date();

		return (
			<div>
				<DatePicker siteId={ siteId } initialDate={ initialDate } onChange={ this.dateChange } />

				<p>Welcome to the backup detail page for site { this.props.siteId }</p>
				<ActivityList logs={ this.props.logs } />
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const logs = requestActivityLogs( siteId, { group: 'rewind' } );

	return {
		siteId,
		logs,
	};
} )( BackupsPage );
