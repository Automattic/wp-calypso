/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Gravatar from './gravatar';
import Button from 'components/button';
import humanDate from 'lib/human-date';
import { getReviewReply } from 'woocommerce/state/sites/review-replies/selectors';

class ReviewReply extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		reviewId: PropTypes.number.isRequired,
		replyId: PropTypes.number.isRequired,
	};

	renderReplyActions = () => {
		const { translate } = this.props;
		return (
			<div className="reviews__reply-actions">
				<Button borderless className="reviews__reply-action-edit">
					<Gridicon icon="pencil" />
					<span>{ translate( 'Edit reply' ) }</span>
				</Button>
				<Button borderless className="reviews__reply-action-delete">
					<Gridicon icon="trash" />
					<span>{ translate( 'Delete reply' ) }</span>
				</Button>
			</div>
		);
	}

	render() {
		const { reply } = this.props;
		const content = reply.content && reply.content.rendered || '';
		return (
			<div className="reviews__reply">
				<div className="reviews__reply-bar">
					<div className="reviews__author-gravatar">
						<Gravatar
							object={ reply }
							forType="reply"
						/>
					</div>

					<div className="reviews__info">
						<div className="reviews__author-name">{ reply.author_name }</div>
						<div className="reviews__date">{ humanDate( reply.date_gmt + 'Z' ) }</div>
					</div>

					{ this.renderReplyActions() }
				</div>

				<div className="reviews__reply-content"
					dangerouslySetInnerHTML={ { __html: content } } //eslint-disable-line react/no-danger
					// Sets the rendered comment HTML correctly for display.
					// Also used for comments in `comment-detail/comment-detail-comment.jsx`
				/>
			</div>
		);
	}

}

export default connect(
	( state, props ) => {
		const reply = getReviewReply( state, props.reviewId, props.replyId );
		return {
			reply,
		};
	}
)( localize( ReviewReply ) );
