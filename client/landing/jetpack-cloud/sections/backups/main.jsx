/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import getRewindBackups from 'state/selectors/get-rewind-backups';
import QueryRewindBackups from 'components/data/query-rewind-backups';

class BackupsPage extends Component {
	render() {
		const { backups, siteId } = this.props;

		const numBackups = backups ? backups.length : 0;

		return (
			<div>
				<QueryRewindBackups siteId={ siteId } />
				<div>Welcome to the backup detail page for site { siteId }.</div>
				<div>This site has { numBackups } backups.</div>
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const backups = getRewindBackups( state, siteId );

	return {
		siteId,
		backups,
	};
} )( BackupsPage );
