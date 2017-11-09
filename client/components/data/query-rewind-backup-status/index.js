/** @format */
/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Interval, { EVERY_SECOND } from 'lib/interval';
import { getRewindBackupProgress as getBackupProgress } from 'state/activity-log/actions';

class QueryRewindBackupStatus extends Component {
	static propTypes = {
		downloadId: PropTypes.number,
		siteId: PropTypes.number.isRequired,
	};

	query = () => {
		const { downloadId, siteId } = this.props;

		if ( siteId && downloadId ) {
			this.props.getBackupProgress( siteId, downloadId );
		}
	};

	render() {
		return <Interval onTick={ this.query } period={ EVERY_SECOND } />;
	}
}

export default connect( null, { getBackupProgress } )( QueryRewindBackupStatus );
