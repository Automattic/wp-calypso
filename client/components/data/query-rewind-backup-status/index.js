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
import { getRewindBackupProgress } from 'calypso/state/activity-log/actions';

class QueryRewindBackupStatus extends Component {
	static propTypes = {
		downloadId: PropTypes.number,
		siteId: PropTypes.number.isRequired,
	};

	UNSAFE_componentWillMount() {
		// We want to run this only once: when the page is loaded. In such case, there is not known download Id.
		// If there's a download Id here it means this was mounted during an action requesting progress for a
		// specific download Id, so we will do nothing here,since it will be handled by the <Interval /> below.
		if ( ! this.props.downloadId ) {
			const { siteId } = this.props;

			if ( siteId ) {
				this.props.getRewindBackupProgress( siteId );
			}
		}
	}

	query = () => {
		const { downloadId, siteId } = this.props;

		if ( siteId && downloadId ) {
			this.props.getRewindBackupProgress( siteId );
		}
	};

	render() {
		return <Interval onTick={ this.query } period={ EVERY_SECOND } />;
	}
}

export default connect( null, { getRewindBackupProgress } )( QueryRewindBackupStatus );
