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
import { requestPostRevisions } from 'state/posts/revisions/actions';

class QueryPostRevisions extends Component {
	componentWillMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.siteId === prevProps.siteId && this.props.postId === prevProps.postId ) {
			return;
		}

		this.request();
	}

	request() {
		const { comparisons, postId, siteId } = this.props;
		this.props.requestPostRevisions( siteId, postId, comparisons );
	}

	render() {
		return null;
	}
}

QueryPostRevisions.propTypes = {
	comparisons: PropTypes.array,
	postId: PropTypes.number,
	siteId: PropTypes.number,

	// connected to dispatch
	requestPostRevisions: PropTypes.func,
};

export default connect( null, { requestPostRevisions } )( QueryPostRevisions );
