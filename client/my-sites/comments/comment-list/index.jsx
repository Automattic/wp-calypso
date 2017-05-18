/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import CommentDetail from 'blocks/comment-detail/docs/example';

export class CommentList extends Component {
	render() {
		return (
			<div className="comment-list">
				<CommentDetail />
				<CommentDetail />
				<CommentDetail />
				<CommentDetail />
				<CommentDetail />
			</div>
		);
	}
}

export default CommentList;
