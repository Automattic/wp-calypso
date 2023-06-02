import { Component } from 'react';
import { connect } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { requestFollows } from 'calypso/state/reader/follows/actions';
import shouldSyncReaderFollows from 'calypso/state/selectors/should-sync-reader-follows';

class SyncReaderFollows extends Component {
	check() {
		if ( this.props.isLoggedIn && this.props.shouldSync ) {
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
		isLoggedIn: isUserLoggedIn( state ),
	} ),
	{ requestFollows }
)( SyncReaderFollows );
