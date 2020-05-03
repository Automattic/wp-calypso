/**
 * External depedencies
 *
 */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import accept from 'lib/accept';
import { Button } from '@automattic/components';
import { decodeEntities, removep } from 'lib/formatting';
import {
	deleteReviewReply,
	updateReviewReply,
} from 'woocommerce/state/sites/review-replies/actions';
import {
	editReviewReply,
	clearReviewReplyEdits,
} from 'woocommerce/state/ui/review-replies/actions';
import {
	getCurrentlyEditingReviewReplyId,
	getReviewReplyEdits,
} from 'woocommerce/state/ui/review-replies/selectors';
import { getReviewReply } from 'woocommerce/state/sites/review-replies/selectors';
import Gravatar from './gravatar';
import humanDate from 'lib/human-date';

class ReviewReply extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		reviewId: PropTypes.number.isRequired,
		replyId: PropTypes.number.isRequired,
	};

	onEdit = () => {
		const { siteId, reviewId, reply } = this.props;
		let content = ( reply.content && reply.content.rendered ) || '';
		content = removep( decodeEntities( content ) );
		this.props.editReviewReply( siteId, reviewId, { id: reply.id, content } );
	};

	onCancel = () => {
		const { siteId } = this.props;
		this.props.clearReviewReplyEdits( siteId );
	};

	onTextChange = ( event ) => {
		const { value } = event.target;
		const { siteId, reviewId, replyId } = this.props;
		this.props.editReviewReply( siteId, reviewId, { id: replyId, content: value } );
	};

	onDelete = () => {
		const { siteId, reviewId, replyId, translate } = this.props;
		const areYouSure = translate( 'Are you sure you want to permanently delete this reply?' );
		accept( areYouSure, ( accepted ) => {
			if ( ! accepted ) {
				return;
			}
			this.props.deleteReviewReply( siteId, reviewId, replyId );
		} );
	};

	onSave = () => {
		const { siteId, reviewId, replyId, replyEdits } = this.props;
		this.props.updateReviewReply( siteId, reviewId, replyId, replyEdits );
	};

	renderReplyActions = () => {
		const { translate } = this.props;
		return (
			<div className="reviews__reply-actions">
				<Button borderless className="reviews__reply-action-edit" onClick={ this.onEdit }>
					<Gridicon icon="pencil" size={ 18 } />
					<span>{ translate( 'Edit reply' ) }</span>
				</Button>
				<Button borderless className="reviews__reply-action-delete" onClick={ this.onDelete }>
					<Gridicon icon="trash" size={ 18 } />
					<span>{ translate( 'Delete reply' ) }</span>
				</Button>
			</div>
		);
	};

	render() {
		const { isEditing } = this.props;
		if ( isEditing ) {
			return this.renderEdit();
		}

		return this.renderView();
	}

	renderEdit() {
		const { translate, editContent } = this.props;
		return (
			<div className="reviews__reply-edit">
				<textarea onChange={ this.onTextChange } value={ editContent } />

				<div className="reviews__reply-edit-buttons">
					<Button compact onClick={ this.onCancel }>
						{ translate( 'Cancel' ) }
					</Button>

					<Button compact primary onClick={ this.onSave }>
						{ translate( 'Save' ) }
					</Button>
				</div>
			</div>
		);
	}

	renderView() {
		const { reply } = this.props;
		const content = ( reply.content && reply.content.rendered ) || '';
		return (
			<div className="reviews__reply">
				<div className="reviews__reply-bar">
					<div className="reviews__author-gravatar">
						<Gravatar object={ reply } forType="reply" />
					</div>

					<div className="reviews__info">
						<div className="reviews__author-name">{ reply.author_name }</div>
						<div className="reviews__date">{ humanDate( reply.date_gmt + 'Z' ) }</div>
					</div>

					{ this.renderReplyActions() }
				</div>

				<div
					className="reviews__reply-content"
					dangerouslySetInnerHTML={ { __html: content } } //eslint-disable-line react/no-danger
					// Sets the rendered comment HTML correctly for display.
					// Also used for comments in `comments/comment/comment-content.jsx`
				/>
			</div>
		);
	}
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			editReviewReply,
			clearReviewReplyEdits,
			deleteReviewReply,
			updateReviewReply,
		},
		dispatch
	);
}

export default connect( ( state, props ) => {
	const reply = getReviewReply( state, props.reviewId, props.replyId );
	const isEditing = props.replyId === getCurrentlyEditingReviewReplyId( state );
	const replyEdits = getReviewReplyEdits( state );
	const editContent = replyEdits.content || '';
	return {
		reply,
		isEditing,
		replyEdits,
		editContent,
	};
}, mapDispatchToProps )( localize( ReviewReply ) );
