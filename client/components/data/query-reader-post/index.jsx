import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { isPostKeyLike } from 'calypso/reader/post-key';
import { fetchPost } from 'calypso/state/reader/posts/actions';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';

class QueryReaderPost extends Component {
	static propTypes = {
		postKey: PropTypes.object.isRequired,
		isHelpCenter: PropTypes.bool,
	};

	componentDidMount() {
		this.maybeFetch();
	}

	componentDidUpdate() {
		this.maybeFetch();
	}

	maybeFetch = () => {
		const { post, postKey, isHelpCenter } = this.props;
		if ( isPostKeyLike( postKey ) && ( ! post || post._state === 'minimal' ) ) {
			this.props.fetchPost( postKey, isHelpCenter );
		}
	};

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => ( {
		post: getPostByKey( state, ownProps.postKey ),
		isHelpCenter: ownProps.isHelpCenter,
	} ),
	{ fetchPost }
)( QueryReaderPost );
