/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestPostRevisions } from 'calypso/state/posts/revisions/actions';
import { getEditedPostValue } from 'calypso/state/posts/selectors';

class QueryPostRevisions extends Component {
	componentDidMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.siteId === prevProps.siteId && this.props.postId === prevProps.postId ) {
			return;
		}

		this.request();
	}

	request() {
		const { comparisons, postId, postType, siteId } = this.props;
		this.props.requestPostRevisions( siteId, postId, postType, comparisons );
	}

	render() {
		return null;
	}
}

QueryPostRevisions.propTypes = {
	comparisons: PropTypes.array,
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
