/** @format */
/**
 * External Dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import { shouldSyncReaderFollows } from 'state/selectors';
import { requestFollows } from 'state/reader/follows/actions';

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
	state => ( {
		shouldSync: shouldSyncReaderFollows( state ),
	} ),
	{ requestFollows }
)( SyncReaderFollows );
