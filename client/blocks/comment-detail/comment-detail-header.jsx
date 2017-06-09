/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import CommentDetailActions from './comment-detail-actions';
import ExternalLink from 'components/external-link';
import FormCheckbox from 'components/forms/form-checkbox';

const controlExternalLink = isBulkEdit => event => {
	if ( isBulkEdit ) {
		event.preventDefault();
	} else {
		event.stopPropagation();
	}
};

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
	postUrl,
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
					<FormCheckbox checked={ commentIsSelected } />
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
						{ translate( 'on {{postLink/}}', {
							components: {
								postLink:
									<ExternalLink href={ postUrl } onClick={ controlExternalLink( isBulkEdit ) }>
										{ postTitle }
									</ExternalLink>,
							},
						} ) }
					</div>
				</div>
			</div>
			<div className="comment-detail__comment-preview">
				{ commentContent }
			</div>
		</div>
	);
};

export default localize( CommentDetailHeader );
