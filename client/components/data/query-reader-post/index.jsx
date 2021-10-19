import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { isPostKeyLike } from 'calypso/reader/post-key';
import { fetchPost } from 'calypso/state/reader/posts/actions';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';

class QueryReaderPost extends Component {
	static propTypes = {
		postKey: PropTypes.object.isRequired,
	};

	componentDidMount() {
		this.maybeFetch();
	}

	componentDidUpdate() {
		this.maybeFetch();
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
