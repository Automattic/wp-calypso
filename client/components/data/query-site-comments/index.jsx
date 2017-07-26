/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';
import { each, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { requestComment, requestCommentsTree } from 'state/comments/actions';
import getSiteCommentsTree from 'state/selectors/get-site-comments-tree';

const requestTree = ( { requestSiteCommentsTree, siteId, status } ) => (
	siteId && requestSiteCommentsTree( siteId, status )
);

const requestComments = ( { commentsTree, requestSingleComment, siteId } ) => {
	if ( isEmpty( commentsTree ) ) {
		return;
	}
	each( commentsTree, ( { commentId } ) => {
		requestSingleComment( siteId, commentId );
	} );
};

export class QuerySiteComments extends Component {
	componentDidMount() {
		requestTree( this.props );
	}

	componentDidUpdate( { commentsTree, siteId, status } ) {
		if ( siteId !== this.props.siteId || status !== this.props.status ) {
			requestTree( this.props );
		}
		if ( commentsTree !== this.props.commentsTree ) {
			requestComments( this.props );
		}
	}

	render() {
		return null;
	}
}

const mapStateToProps = ( state, { siteId, status } ) => ( {
	commentsTree: getSiteCommentsTree( state, siteId, status ),
} );

const mapDispatchToProps = dispatch => ( {
	requestSingleComment: ( siteId, commentId ) => dispatch( requestComment( { siteId, commentId } ) ),
	requestSiteCommentsTree: ( siteId, status = 'unapproved' ) => dispatch( requestCommentsTree( { siteId, status } ) ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( QuerySiteComments );
