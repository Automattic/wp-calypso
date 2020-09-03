/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { SUPPORT_BLOG_ID } from 'blocks/inline-help/constants';
import { fetchAlternates } from 'state/support-articles-alternates/actions';
import {
	isRequestingSupportArticleAlternates,
	isRequestingSupportArticleAlternatesCompleted,
} from 'state/support-articles-alternates/selectors';
import { isPostKeyLike } from 'reader/post-key';

class QuerySupportArticleAlternates extends Component {
	static propTypes = {
		postKey: PropTypes.object.isRequired,
		blogId: PropTypes.number,
		postId: PropTypes.number.isRequired,
		isRequesting: PropTypes.bool,
		isRequestingCompleted: PropTypes.bool,
	};

	componentDidMount() {
		this.maybeFetch();
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		this.maybeFetch( nextProps );
	}

	maybeFetch = ( props = this.props ) => {
		if ( isPostKeyLike( props.postKey ) && ! props.isRequesting && ! props.isRequestingCompleted ) {
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
			isRequesting: isRequestingSupportArticleAlternates( state, postKey ),
			isRequestingCompleted: isRequestingSupportArticleAlternatesCompleted( state, postKey ),
		};
	},
	{ fetchAlternates }
)( QuerySupportArticleAlternates );
