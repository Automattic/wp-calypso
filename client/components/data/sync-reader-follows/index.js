/**
 * External dependencies
 */

import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import shouldSyncReaderFollows from 'calypso/state/selectors/should-sync-reader-follows';
import { requestFollows } from 'calypso/state/reader/follows/actions';

class SyncReaderFollows extends Component {
	check() {
		if ( this.props.shouldSync ) {
			this.props.requestFollows();
		}
	}

	componentDidMount() {
		this.check();
	}

	componentDidUpdate() {
		this.check();
	}

	render() {
		return null;
	}
}

export default connect(
	( state ) => ( {
		shouldSync: shouldSyncReaderFollows( state ),
	} ),
	{ requestFollows }
)( SyncReaderFollows );
