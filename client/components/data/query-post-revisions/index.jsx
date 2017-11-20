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
import { getEditedPostValue } from 'state/posts/selectors';

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
		this.props.requestPostRevisions( this.props.siteId, this.props.postId, this.props.postType );
	}

	render() {
		return null;
	}
}

QueryPostRevisions.propTypes = {
	postId: PropTypes.number,
	siteId: PropTypes.number,

	// connected to state
	postType: PropTypes.string,

	// connected to dispatch
	requestPostRevisions: PropTypes.func,
};

export default connect(
	( state, { postId, siteId } ) => ( {
		postType: getEditedPostValue( state, siteId, postId, 'type' ),
	} ),
	{ requestPostRevisions }
)( QueryPostRevisions );
