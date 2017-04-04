/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSitePostRevisions } from 'state/posts/revisions/actions';

class QueryPostRevisions extends Component {
	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId &&
				this.props.postId === nextProps.postId ) {
			return;
		}

		this.request( nextProps );
	}

	request( props ) {
		props.requestSitePostRevisions( props.siteId, props.postId );
	}

	render() {
		return null;
	}
}

QueryPostRevisions.propTypes = {
	postId: PropTypes.number,
	siteId: PropTypes.number,
	requestSitePostRevisions: PropTypes.func,
};

export default connect(
	() => {
		return {};
	},
	{ requestSitePostRevisions }
)( QueryPostRevisions );
