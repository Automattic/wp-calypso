/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CommentDetailAuthor from './comment-detail-author';

export class CommentDetailComment extends Component {
	static propTypes = {
		comment: PropTypes.object,
	};

	render() {
		const {
			comment,
			translate,
		} = this.props;

		return (
			<div className="comment-detail__comment">
				<div className="comment-detail__comment-content">
					<CommentDetailAuthor
						author={ comment.author }
						commentDate={ comment.date }
					/>

					<div className="comment-detail__comment-body">
						{ comment.body }
					</div>

					<div className="comment-detail__comment-reply">
						<a>
							<Gridicon icon="reply" />
							<span>{ translate( 'You replied to this comment' ) }</span>
						</a>
					</div>
				</div>
			</div>
		);
	}
}

export default localize( CommentDetailComment );
