/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { get, noop } from 'lodash';

/**
 * Internal dependencies
 */
import AutoDirection from 'components/auto-direction';
import Button from 'components/button';
import CommentDetailActions from './comment-detail-actions';
import Emojify from 'components/emojify';
import Gravatar from 'components/gravatar';
import FormCheckbox from 'components/forms/form-checkbox';
import { stripHTML, decodeEntities } from 'lib/formatting';
import { urlToDomainAndPath } from 'lib/url';
import { getSiteComment } from 'state/selectors';
import { getAuthorDisplayName, getPostTitle } from './utils';

export const CommentDetailHeader = ( {
	authorAvatarUrl,
	authorDisplayName,
	authorUrl,
	commentContent,
	commentId,
	commentIsSelected,
	commentType,
	deleteCommentPermanently,
	isBulkEdit,
	isEditMode,
	isExpanded,
	postTitle,
	siteId,
	toggleApprove,
	toggleEditMode,
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
		<div className={ classes } onClick={ isExpanded ? noop : handleFullHeaderClick }>
			{ isExpanded &&
			! isEditMode && (
				<CommentDetailActions
					commentId={ commentId }
					deleteCommentPermanently={ deleteCommentPermanently }
					siteId={ siteId }
					toggleApprove={ toggleApprove }
					toggleEditMode={ toggleEditMode }
					toggleLike={ toggleLike }
					toggleSpam={ toggleSpam }
					toggleTrash={ toggleTrash }
				/>
			) }

			{ isExpanded &&
			isEditMode && (
				<div className="comment-detail__header-edit-mode">
					<div className="comment-detail__header-edit-title">
						<Gridicon icon="pencil" />
						<span>{ translate( 'Edit Comment' ) }</span>
					</div>
					<Button borderless className="comment-detail__action-collapse" onClick={ toggleEditMode }>
						<Gridicon icon="cross" />
					</Button>
				</div>
			) }

			{ ! isExpanded && (
				<div className="comment-detail__header-content">
					<div className="comment-detail__author-preview">
						{ isBulkEdit && (
							<label className="comment-detail__checkbox">
								<FormCheckbox checked={ commentIsSelected } onChange={ noop } />
							</label>
						) }
						<div className="comment-detail__author-avatar">
							{ 'comment' === commentType && <Gravatar user={ author } /> }
							{ 'comment' !== commentType && <Gridicon icon="link" size={ 24 } /> }
						</div>
						<div className="comment-detail__author-info">
							<div className="comment-detail__author-info-element">
								<strong>
									<Emojify>{ authorDisplayName }</Emojify>
								</strong>
								<span>
									<Emojify>{ urlToDomainAndPath( authorUrl ) }</Emojify>
								</span>
							</div>
							<div className="comment-detail__author-info-element">
								<Emojify>
									{ translate( 'on %(postTitle)s', {
										args: {
											postTitle: postTitle ? decodeEntities( postTitle ) : translate( 'Untitled' ),
										},
									} ) }
								</Emojify>
							</div>
						</div>
					</div>
					<AutoDirection>
						<div className="comment-detail__comment-preview">
							<Emojify>{ decodeEntities( stripHTML( commentContent ) ) }</Emojify>
						</div>
					</AutoDirection>
				</div>
			) }

			{ ! isBulkEdit &&
			! isEditMode && (
				<Button
					borderless
					className="comment-detail__action-collapse"
					disabled={ isEditMode }
					onClick={ isExpanded ? toggleExpanded : noop }
				>
					<Gridicon icon="chevron-down" />
				</Button>
			) }
		</div>
	);
};

const mapStateToProps = ( state, { commentId, siteId } ) => {
	const comment = getSiteComment( state, siteId, commentId );

	return {
		authorAvatarUrl: get( comment, 'author.avatar_URL' ),
		authorDisplayName: getAuthorDisplayName( comment ),
		authorUrl: get( comment, 'author.URL', '' ),
		commentContent: get( comment, 'content' ),
		commentType: get( comment, 'type', 'comment' ),
		postId: get( comment, 'post.ID' ),
		postTitle: getPostTitle( comment ),
	};
};

export default connect( mapStateToProps )( localize( CommentDetailHeader ) );
