/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import CommentDetailActions from './comment-detail-actions';
import FormCheckbox from 'components/forms/form-checkbox';
import AutoDirection from 'components/auto-direction';
import { stripHTML, decodeEntities } from 'lib/formatting';

export const CommentDetailHeader = ( {
	authorAvatarUrl,
	authorDisplayName,
	authorUrl,
	commentContent,
	commentIsLiked,
	commentIsSelected,
	commentStatus,
	deleteCommentPermanently,
	edit,
	isBulkEdit,
	isExpanded,
	postTitle,
	toggleApprove,
	toggleExpanded,
	toggleLike,
	toggleSelected,
	toggleSpam,
	toggleTrash,
	translate,
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
					commentIsLiked={ commentIsLiked }
					commentStatus={ commentStatus }
					deleteCommentPermanently={ deleteCommentPermanently }
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
			onClick={ isBulkEdit ? toggleSelected : toggleExpanded }
		>
			{ isBulkEdit &&
				<label className="comment-detail__checkbox">
					<FormCheckbox checked={ commentIsSelected } onChange={ noop } />
				</label>
			}
			<div className="comment-detail__author-preview">
				<div className="comment-detail__author-avatar">
					<img className="comment-detail__author-avatar-image" src={ authorAvatarUrl } />
				</div>
				<div className="comment-detail__author-info">
					<div className="comment-detail__author-info-element">
						<strong>
							{ authorDisplayName }
						</strong>
						<span>
							{ authorUrl }
						</span>
					</div>
					<div className="comment-detail__author-info-element">
						{ translate( 'on %(postTitle)s', { args: { postTitle } } ) }
					</div>
				</div>
			</div>
			<AutoDirection>
				<div className="comment-detail__comment-preview">
					{ decodeEntities( stripHTML( commentContent ) ) }
				</div>
			</AutoDirection>
		</div>
	);
};

export default localize( CommentDetailHeader );
