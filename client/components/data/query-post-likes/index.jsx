/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestPostLikes } from 'calypso/state/posts/likes/actions';
import { getPostLikeLastUpdated } from 'calypso/state/posts/selectors/get-post-like-last-updated';
import { getPostLikes } from 'calypso/state/posts/selectors/get-post-likes';
import { Interval } from 'calypso/lib/interval';

class QueryPostLikes extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		needsLikers: PropTypes.bool,
		hasPostLikes: PropTypes.bool,
		maxAgeSeconds: PropTypes.number, // max age of likes data in milliseconds
		lastUpdated: PropTypes.number, // timestamp of when the like data was last updated
		requestPostLikes: PropTypes.func.isRequired,
	};

	static defaultProps = {
		maxAgeSeconds: 120,
		needsLikers: false,
	};

	componentDidMount() {
		this.request();
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId || this.props.postId !== nextProps.postId ) {
			this.request( nextProps );
		}
	}

	request = (
		{
			requestPostLikes: requestLikes,
			siteId,
			postId,
			maxAgeSeconds,
			hasPostLikes,
			needsLikers,
			lastUpdated,
		} = this.props
	) => {
		if (
			! lastUpdated ||
			Date.now() - lastUpdated > maxAgeSeconds * 1000 ||
			( needsLikers && ! hasPostLikes )
		) {
			requestLikes( siteId, postId, maxAgeSeconds );
		}
	};

	render() {
		return <Interval period={ this.props.maxAgeSeconds + 1 } onTick={ this.request } />;
	}
}

export default connect(
	( state, { siteId, postId } ) => ( {
		lastUpdated: getPostLikeLastUpdated( state, siteId, postId ),
		hasPostLikes: getPostLikes( state, siteId, postId ) !== null,
	} ),
	{ requestPostLikes }
)( QueryPostLikes );
