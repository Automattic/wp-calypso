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

class QueryPostLikes extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		requestPostLikes: PropTypes.func,
	};

	componentDidMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId || this.props.postId !== nextProps.postId ) {
			this.request( nextProps );
		}
	}

	request( { requestPostLikes: rpl, siteId, postId } ) {
		rpl( siteId, postId );
	}

	render() {
		return null;
	}
}

export default connect( null, { requestPostLikes } )( QueryPostLikes );
