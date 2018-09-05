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
import { requestSitePost } from 'state/gutenberg/sites/posts/actions';

export class QueryGutenbergSitePost extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
	};

	componentDidMount() {
		this.request();
	}

	componentDidUpdate( { siteId, postId } ) {
		if ( siteId !== this.props.siteId || postId !== this.props.postId ) {
			this.request();
		}
	}

	request() {
		const { siteId, postId, requestSitePost: dispatchRequestSitePost } = this.props;
		if ( siteId && postId ) {
			dispatchRequestSitePost( siteId, postId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	null,
	{ requestSitePost }
)( QueryGutenbergSitePost );
