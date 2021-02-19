/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { SUPPORT_BLOG_ID } from 'calypso/blocks/inline-help/constants';
import { fetchAlternates } from 'calypso/state/support-articles-alternates/actions';
import { shouldRequestSupportArticleAlternates } from 'calypso/state/support-articles-alternates/selectors';
import { isPostKeyLike } from 'calypso/reader/post-key';

class QuerySupportArticleAlternates extends Component {
	static propTypes = {
		postKey: PropTypes.object.isRequired,
		blogId: PropTypes.number,
		postId: PropTypes.number.isRequired,
		shouldRequestAlternates: PropTypes.bool,
	};

	componentDidMount() {
		this.maybeFetch();
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		this.maybeFetch( nextProps );
	}

	maybeFetch = ( props = this.props ) => {
		if ( isPostKeyLike( props.postKey ) && props.shouldRequestAlternates ) {
			this.props.fetchAlternates( props.postKey );
		}
	};

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		const postKey = {
			blogId: ownProps.blogId || SUPPORT_BLOG_ID,
			postId: ownProps.postId,
		};

		return {
			postKey,
			shouldRequestAlternates: shouldRequestSupportArticleAlternates( state, postKey ),
		};
	},
	{ fetchAlternates }
)( QuerySupportArticleAlternates );
