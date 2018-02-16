/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchPost } from 'lib/feed-post-store/actions';
import { getPostByKey } from 'state/reader/posts/selectors';
import { isPostKeyLike } from 'lib/feed-stream-store/post-key';

class QueryReaderPost extends Component {
	static propTypes = {
		postKey: PropTypes.object.isRequired,
	};

	componentDidMount() {
		this.maybeFetch();
	}

	componentWillReceiveProps( nextProps ) {
		this.maybeFetch( nextProps );
	}

	maybeFetch = ( props = this.props ) => {
		if ( isPostKeyLike( props.postKey ) && ( ! props.post || props.post._state === 'minimal' ) ) {
			fetchPost( props.postKey );
		}
	};

	render() {
		return null;
	}
}

export default connect( ( state, ownProps ) => ( {
	post: getPostByKey( state, ownProps.postKey ),
} ) )( QueryReaderPost );
