/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchPost } from 'calypso/state/reader/posts/actions';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import { isPostKeyLike } from 'calypso/reader/post-key';

class QueryReaderPost extends Component {
	static propTypes = {
		postKey: PropTypes.object.isRequired,
	};

	componentDidMount() {
		this.maybeFetch();
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		this.maybeFetch( nextProps );
	}

	maybeFetch = ( props = this.props ) => {
		if ( isPostKeyLike( props.postKey ) && ( ! props.post || props.post._state === 'minimal' ) ) {
			this.props.fetchPost( props.postKey );
		}
	};

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => ( {
		post: getPostByKey( state, ownProps.postKey ),
	} ),
	{ fetchPost }
)( QueryReaderPost );
