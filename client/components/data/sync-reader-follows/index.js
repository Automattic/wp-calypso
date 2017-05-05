/**
 * External Dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import { getReaderFollowsLastSyncTime } from 'state/selectors';
import { requestFollows } from 'state/reader/follows/actions';

const TIME_BETWEEN_SYNCS = 1000 * 60 * 60; // one hour

class SyncReaderFollows extends Component {
	check() {
		if ( ! this.props.lastSyncTime ||
			Date.now() > this.props.lastSyncTime + TIME_BETWEEN_SYNCS ) {
			this.props.requestFollows();
		}
	}

	componentDidMount() {
		this.check();
	}

	componentDidUpate() {
		this.check();
	}

	render() {
		return null;
	}
}

export default connect(
	( state ) => ( {
		lastSyncTime: getReaderFollowsLastSyncTime( state ) || 0
	} ),
	{ requestFollows }
)( SyncReaderFollows );
