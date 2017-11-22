/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import Comment from 'my-sites/comments/comment';
import { getSiteCommentParentDepth, getSiteCommentRepliesTree } from 'state/selectors';

export class CommentRepliesList extends Component {
	render() {
		const { siteId, commentParentId, depth, replies } = this.props;

		const classes = classNames( { 'comment-replies-list': depth < 2 } );

		return (
			<div className={ classes }>
				{ map( replies, ( { commentId } ) => (
					<Comment
						commentId={ commentId }
						key={ `comment-${ siteId }-${ commentParentId }-${ commentId }` }
						refreshCommentData={ true }
						isPostView={ true }
					/>
				) ) }
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId, commentParentId } ) => ( {
	commentParentId,
	depth: getSiteCommentParentDepth( state, siteId, commentParentId ),
	replies: getSiteCommentRepliesTree( state, siteId, 'all', commentParentId ),
} );

export default connect( mapStateToProps )( localize( CommentRepliesList ) );
