/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { shouldFetchRelated } from 'state/reader/related-posts/selectors';
import { requestRelatedPosts } from 'state/reader/related-posts/actions';
import { SCOPE_ALL, SCOPE_SAME, SCOPE_OTHER } from 'state/reader/related-posts/utils';

class QueryReaderRelatedPosts extends Component {
	UNSAFE_componentWillMount() {
		if ( this.props.shouldFetch ) {
			this.props.requestRelatedPosts( this.props.siteId, this.props.postId, this.props.scope );
		}
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if (
			! nextProps.shouldFetch ||
			( this.props.siteId === nextProps.siteId &&
				this.props.postId === nextProps.postId &&
				this.props.scope === nextProps.scope )
		) {
			return;
		}

		nextProps.requestRelatedPosts( nextProps.siteId, nextProps.postId, nextProps.scope );
	}

	render() {
		return null;
	}
}

QueryReaderRelatedPosts.propTypes = {
	siteId: PropTypes.number,
	postId: PropTypes.number,
	scope: PropTypes.oneOf( [ SCOPE_ALL, SCOPE_SAME, SCOPE_OTHER ] ),
	shouldFetch: PropTypes.bool,
	requestRelatedPosts: PropTypes.func,
};

QueryReaderRelatedPosts.defaultProps = {
	scope: SCOPE_ALL,
	requestRelatedPosts: () => {},
};

export default connect(
	( state, ownProps ) => {
		const { siteId, postId, scope } = ownProps;
		return {
			shouldFetch: shouldFetchRelated( state, siteId, postId, scope ),
		};
	},
	( dispatch ) => {
		return bindActionCreators(
			{
				requestRelatedPosts,
			},
			dispatch
		);
	}
)( QueryReaderRelatedPosts );

export function QueryReaderRelatedPostsSameSite( props ) {
	return <QueryReaderRelatedPosts scope={ SCOPE_SAME } { ...props } />;
}

export function QueryReaderRelatedPostsOtherSites( props ) {
	return <QueryReaderRelatedPosts scope={ SCOPE_OTHER } { ...props } />;
}
