/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { filter, get, map } from 'lodash';

/**
 * Internal dependencies
 */
import Comment from 'my-sites/comments/comment';
import QuerySiteCommentsTree from 'components/data/query-site-comments-tree';
import { getSiteComment, getSiteCommentsTree } from 'state/selectors';

export class CommentRepliesList extends Component {
	render() {
		const { siteId, commentParentId, depth, replies } = this.props;

		const style = {
			marginLeft: depth < 2 ? '56px' : '0',
		};

		return (
			<div className="comment-replies-list" style={ style }>
				<QuerySiteCommentsTree siteId={ siteId } />
				{ map( replies, ( { commentId } ) => (
					<Comment
						commentId={ commentId }
						key={ `comment-${ siteId }-${ commentParentId }-${ commentId }` }
						refreshCommentData={ true }
					/>
				) ) }
			</div>
		);
	}
}

const getParentDepth = ( state, siteId, commentId ) => {
	const comment = getSiteComment( state, siteId, commentId );
	const parentId = get( comment, [ 'parent', 'ID' ], 0 );

	if ( ! comment ) {
		return 0;
	}

	return parentId ? 1 + getParentDepth( state, siteId, get( comment, [ 'parent', 'ID' ], 0 ) ) : 0;
};

const mapStateToProps = ( state, ownProps ) => {
	const { siteId, commentParentId } = ownProps;
	const replies = filter( getSiteCommentsTree( state, siteId, 'all' ), { commentParentId } );

	const depth = getParentDepth( state, siteId, commentParentId );

	return {
		commentParentId,
		depth,
		replies,
	};
};

export default connect( mapStateToProps )( localize( CommentRepliesList ) );
