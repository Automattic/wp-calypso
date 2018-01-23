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
import { getRewindRestoreProgress } from 'state/activity-log/actions';

class QueryRewindRestoreStatus extends Component {
	static propTypes = {
		restoreId: PropTypes.number,
		siteId: PropTypes.number.isRequired,
	};

	componentWillMount() {
		// We want to run this only once: when the page is loaded. In such case, there is not known restore Id.
		// If there's a restore Id here it means this was mounted during an action requesting progress for a
		// specific restore Id, so we will do nothing here,since it will be handled by the <Interval /> below.
		if ( ! this.props.restoreId ) {
			const { siteId } = this.props;

			if ( siteId ) {
				this.props.getRewindRestoreProgress( siteId );
			}
		}
	}

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
