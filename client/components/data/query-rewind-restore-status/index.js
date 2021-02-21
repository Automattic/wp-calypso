/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Interval, EVERY_SECOND } from 'calypso/lib/interval';
import { getRewindRestoreProgress } from 'calypso/state/activity-log/actions';

class QueryRewindRestoreStatus extends Component {
	static propTypes = {
		restoreId: PropTypes.number,
		siteId: PropTypes.number.isRequired,
	};

	query = () => {
		const { restoreId, siteId } = this.props;
		if ( siteId && restoreId ) {
			this.props.getRewindRestoreProgress( siteId, restoreId );
		}
	};

	render() {
		return <Interval onTick={ this.query } period={ EVERY_SECOND } />;
	}
}

export default connect( null, { getRewindRestoreProgress } )( QueryRewindRestoreStatus );
