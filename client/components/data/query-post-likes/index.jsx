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
import { requestPostLikes } from 'state/posts/likes/actions';
import getPostLikeLastUpdated from 'state/selectors/get-post-like-last-updated';
import getPostLikes from 'state/selectors/get-post-likes';

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
		maxAgeSeconds: 60 * 5,
		needsLikers: false,
	};

	componentDidMount() {
		this.request( this.props );
		this.restartInterval( this.props.maxAgeSeconds );
	}

	componentWillUnmount() {
		if ( this.checkInterval ) {
			clearInterval( this.checkInterval );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId || this.props.postId !== nextProps.postId ) {
			this.request( nextProps );
		}
		this.restartInterval( nextProps.maxAgeSeconds );
	}

	restartInterval = seconds => {
		if ( this.checkInterval ) {
			clearInterval( this.checkInterval );
		}
		this.checkInterval = setInterval( this.request, seconds * 1000 + 10 );
	};

	request = ( {
		requestPostLikes: requestLikes,
		siteId,
		postId,
		maxAgeSeconds,
		hasPostLikes,
		needsLikers,
		lastUpdated,
	} ) => {
		if (
			! lastUpdated ||
			Date.now() - lastUpdated > maxAgeSeconds * 1000 ||
			( needsLikers && ! hasPostLikes )
		) {
			requestLikes( siteId, postId, maxAgeSeconds );
		}
	};

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId, postId } ) => ( {
		lastUpdated: getPostLikeLastUpdated( state, siteId, postId ),
		hasPostLikes: getPostLikes( state, siteId, postId ) !== null,
	} ),
	{ requestPostLikes }
)( QueryPostLikes );
