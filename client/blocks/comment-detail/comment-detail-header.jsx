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
import AutoDirection from 'components/auto-direction';
import Button from 'components/button';
import CommentDetailActions from './comment-detail-actions';
import Gravatar from 'components/gravatar';
import FormCheckbox from 'components/forms/form-checkbox';
import { stripHTML, decodeEntities } from 'lib/formatting';
import { urlToDomainAndPath } from 'lib/url';

export const CommentDetailHeader = ( {
	siteId,
	postId,
	commentId,
	authorAvatarUrl,
	authorDisplayName,
	authorUrl,
	commentContent,
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
				<Button
					borderless
					className="comment-detail__action-collapse"
					onClick={ toggleExpanded }
				>
					<Gridicon icon="cross" />
				</Button>

				<CommentDetailActions
					siteId={ siteId }
					postId={ postId }
					commentId={ commentId }
					edit={ edit }
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

	const author = {
		avatar_URL: authorAvatarUrl,
		display_name: authorDisplayName,
	};

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
				<Gravatar user={ author } />
				<div className="comment-detail__author-info">
					<div className="comment-detail__author-info-element">
						<strong>
							{ authorDisplayName }
						</strong>
						<span>
							{ urlToDomainAndPath( authorUrl ) }
						</span>
					</div>
					<div className="comment-detail__author-info-element">
						{ translate( 'on %(postTitle)s', { args: {
							postTitle: postTitle ? decodeEntities( postTitle ) : translate( 'Untitled' ),
						} } ) }
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
