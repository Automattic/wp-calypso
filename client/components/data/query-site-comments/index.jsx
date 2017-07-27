/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { each, isEmpty, reverse, slice, values } from 'lodash';

/**
 * Internal dependencies
 */
import { requestComment, requestCommentsTree } from 'state/comments/actions';
import getSiteCommentsTree from 'state/selectors/get-site-comments-tree';

const requestTree = ( { requestSiteCommentsTree, siteId, status } ) => (
	siteId && requestSiteCommentsTree( siteId, status )
);

const requestComments = props => {
	const {
		commentsPerPage,
		commentsTree,
		page,
		requestSingleComment,
		siteId,
	} = props;

	if ( isEmpty( commentsTree ) ) {
		return;
	}

	if ( ! page || ! commentsPerPage ) {
		each( commentsTree, ( { commentId } ) => {
			requestSingleComment( siteId, commentId );
		} );
		return;
	}

	const startingIndex = ( page - 1 ) * commentsPerPage;
	const parsedCommentsTree = reverse( values( commentsTree ) );
	const commentsPage = slice( parsedCommentsTree, startingIndex, startingIndex + commentsPerPage );

	each( commentsPage, ( { commentId } ) => {
		requestSingleComment( siteId, commentId );
	} );
};

export class QuerySiteComments extends Component {
	static propTypes = {
		commentsPerPage: PropTypes.number,
		page: PropTypes.number,
		siteId: PropTypes.number,
		status: PropTypes.string,
	};

	componentDidMount() {
		requestTree( this.props );
	}

	componentDidUpdate( { commentsTree, page, siteId, status } ) {
		if ( siteId !== this.props.siteId || status !== this.props.status ) {
			requestTree( this.props );
		}
		if ( commentsTree !== this.props.commentsTree || page !== this.props.page ) {
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
