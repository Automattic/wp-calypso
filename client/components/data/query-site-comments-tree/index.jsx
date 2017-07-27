/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestCommentsTree } from 'state/comments/actions';

const requestTree = ( { requestSiteCommentsTree, siteId, status } ) => (
	siteId && requestSiteCommentsTree( siteId, status )
);

export class QuerySiteCommentsTree extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		status: PropTypes.string,
	};

	componentDidMount() {
		requestTree( this.props );
	}

	componentDidUpdate( { siteId, status } ) {
		if ( siteId !== this.props.siteId || status !== this.props.status ) {
			requestTree( this.props );
		}
	}

	render() {
		return null;
	}
}

const mapDispatchToProps = dispatch => ( {
	requestSiteCommentsTree: ( siteId, status = 'unapproved' ) => dispatch( requestCommentsTree( { siteId, status } ) ),
} );

export default connect( null, mapDispatchToProps )( QuerySiteCommentsTree );
