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

class BackupsPage extends Component {
	render() {
		return (
			<div>
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
