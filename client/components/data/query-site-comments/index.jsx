/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestCommentsList } from 'state/comments/actions';

const requestComments = ( { requestSiteComments, siteId, status } ) => (
	siteId && requestSiteComments( { siteId, status } )
);

export class QuerySiteComments extends Component {
	componentDidMount() {
		requestComments( this.props );
	}

	componentDidUpdate( { siteId } ) {
		if ( siteId !== this.props.siteId ) {
			requestComments( this.props );
		}
	}

	render() {
		return null;
	}
}

const mapDispatchToProps = dispatch => ( {
	requestSiteComments: ( { siteId, status = 'unapproved' } ) => dispatch( requestCommentsList( {
		listType: 'site',
		siteId,
		status,
		type: 'comment',
	} ) ),
} );

export default connect( null, mapDispatchToProps )( QuerySiteComments );
