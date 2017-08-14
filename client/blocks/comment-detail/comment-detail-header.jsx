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
	isEditMode,
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
	const author = {
		avatar_URL: authorAvatarUrl,
		display_name: authorDisplayName,
	};

	const classes = classNames( 'comment-detail__header', {
		'is-preview': ! isExpanded,
		'is-bulk-edit': isBulkEdit,
	} );

	const handleFullHeaderClick = isBulkEdit ? toggleSelected : toggleExpanded;

	return (
		<div
			className={ classes }
			onClick={ isExpanded ? noop : handleFullHeaderClick }
		>
			{ isExpanded &&
				<CommentDetailActions
					edit={ edit }
					commentIsLiked={ commentIsLiked }
					commentStatus={ commentStatus }
					deleteCommentPermanently={ deleteCommentPermanently }
					isEditMode={ isEditMode }
					toggleApprove={ toggleApprove }
					toggleLike={ toggleLike }
					toggleSpam={ toggleSpam }
					toggleTrash={ toggleTrash }
				/>
			}

			{ ! isExpanded &&
				<div className="comment-detail__header-content">
					<div className="comment-detail__author-preview">
						{ isBulkEdit &&
							<label className="comment-detail__checkbox">
								<FormCheckbox checked={ commentIsSelected } onChange={ noop } />
							</label>
						}
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
			}

			{ ! isBulkEdit &&
				<Button
					borderless
					className="comment-detail__action-collapse"
					disabled={ isEditMode }
					onClick={ isExpanded ? toggleExpanded : noop }
				>
					<Gridicon icon="chevron-down" />
				</Button>
			}
		</div>
	);
};

export default localize( CommentDetailHeader );
