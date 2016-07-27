/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { isRequestingDiscoveryPosts } from 'state/reader/discover/selectors';
import { requestDiscoverPosts } from 'state/reader/discover/actions';

class QueryReaderDiscoverPosts extends Component {

	constructor( props ) {
		super( props );
		if ( ! this.props.isRequestingDiscoveryPosts ) {
			this.props.requestDiscoverPosts();
		}
	}

	render() {
		return null;
	}

	static propTypes = {
		isRequestingDiscoveryPosts: PropTypes.bool,
		requestDiscoverPosts: PropTypes.func
	}

	static defaultProps = {
		requestDiscoverPosts: () => {}
	}
}

export default connect(
	( state ) => {
		return {
			isRequestingDiscoveryPosts: isRequestingDiscoveryPosts( state )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			requestDiscoverPosts
		}, dispatch );
	}
)( QueryReaderDiscoverPosts );
