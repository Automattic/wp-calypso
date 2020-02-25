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

class BackupsPage extends Component {
	render() {
		const { logs, siteId } = this.props;

		const backupPoints = logs.filter( activity => {
			return activity.activityIsRewindable === true;
		} );

		const list = backupPoints.map( point => <div>{ point.activityDate }</div> );

		return (
			<div>
				<div>Welcome to the backup detail page for site { siteId }.</div>
				<div>This site has { backupPoints.length } backups.</div>
				<div>{ list }</div>
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const logs = siteId && requestActivityLogs( siteId, { group: 'rewind' } );

	return {
		siteId,
		logs: ( siteId && logs.data ) || [],
	};
} )( BackupsPage );
