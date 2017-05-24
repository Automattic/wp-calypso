/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import classNames from 'classnames';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import CommentDetailActions from './comment-detail-actions';
import FormCheckbox from 'components/forms/form-checkbox';

export const CommentDetailHeader = ( {
	authorAvatarUrl,
	authorDisplayName,
	authorUrl,
	commentContent,
	commentIsApproved,
	commentIsLiked,
	commentIsSpam,
	commentIsTrash,
	edit,
	isBulkEdit,
	isExpanded,
	toggleApprove,
	toggleExpanded,
	toggleLike,
	toggleSpam,
	toggleTrash,
} ) => {
	if ( isExpanded ) {
		return (
			<div className="comment-detail__header">
				<div className="comment-detail__actions">
					<a onClick={ toggleExpanded }>
						<Gridicon icon="cross" />
					</a>
				</div>
				<CommentDetailActions
					edit={ edit }
					commentIsApproved={ commentIsApproved }
					commentIsLiked={ commentIsLiked }
					commentIsSpam={ commentIsSpam }
					commentIsTrash={ commentIsTrash }
					toggleApprove={ toggleApprove }
					toggleLike={ toggleLike }
					toggleSpam={ toggleSpam }
					toggleTrash={ toggleTrash }
				/>
			</div>
		);
	}

	return (
		<div
			className={ classNames( 'comment-detail__header', 'is-preview', { 'is-bulk-edit': isBulkEdit } ) }
			onClick={ isBulkEdit ? noop : toggleExpanded }
		>
			{ isBulkEdit &&
				<label className="comment-detail__checkbox">
					<FormCheckbox />
				</label>
			}
			<div className="comment-detail__author-info">
				<div className="comment-detail__author-avatar">
					<img className="comment-detail__author-avatar-image" src={ authorAvatarUrl } />
				</div>
				<strong>
					{ authorDisplayName }
				</strong>
				<span>
					{ authorUrl }
				</span>
			</div>
			<div className="comment-detail__comment-preview">
				{ commentContent }
			</div>
		</div>
	);
};

export default CommentDetailHeader;
