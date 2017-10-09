/**
 * External dependencies
 *
 * @format
 */
import React, { Component } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import AutoDirection from 'components/auto-direction';
import Button from 'components/button';
import CommentDetailActions from './comment-detail-actions';
import Emojify from 'components/emojify';
import Gravatar from 'components/gravatar';
import FormCheckbox from 'components/forms/form-checkbox';
import { stripHTML, decodeEntities } from 'lib/formatting';
import { urlToDomainAndPath } from 'lib/url';
import viewport from 'lib/viewport';
import { convertDateToUserLocation } from 'components/post-schedule/utils';
import { gmtOffset, timezone } from 'lib/site/utils';
import humanDate from 'lib/human-date';

const getFormattedDate = ( commentDate, site ) =>
	humanDate(
		convertDateToUserLocation(
			commentDate || new Date(),
			timezone( site ),
			gmtOffset( site )
		).format( 'll LT' )
	);

export class CommentDetailHeader extends Component {
	state = {
		showQuickActions: false,
	};

	onMouseEnter = () => this.setState( { showQuickActions: true } );

	onMouseLeave = () => this.setState( { showQuickActions: false } );

	render() {
		const {
			authorAvatarUrl,
			authorDisplayName,
			authorUrl,
			commentContent,
			commentIsLiked,
			commentIsSelected,
			commentStatus,
			commentType,
			deleteCommentPermanently,
			isBulkEdit,
			isEditMode,
			isExpanded,
			postTitle,
			toggleReply,
			toggleApprove,
			toggleEditMode,
			toggleExpanded,
			toggleLike,
			toggleSelected,
			toggleSpam,
			toggleTrash,
			translate,
		} = this.props;

		const { showQuickActions } = this.state;

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
				onMouseEnter={ this.onMouseEnter }
				onMouseLeave={ this.onMouseLeave }
			>
				{ isExpanded &&
				isEditMode && (
					<div className="comment-detail__header-edit-mode">
						<div className="comment-detail__header-edit-title">
							<Gridicon icon="pencil" />
							<span>{ translate( 'Edit Comment' ) }</span>
						</div>
						<Button
							borderless
							className="comment-detail__action-collapse"
							onClick={ toggleEditMode }
						>
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
												postTitle: postTitle
													? decodeEntities( postTitle )
													: translate( 'Untitled' ),
											},
										} ) }
									</Emojify>
								</div>
							</div>
							<div className="comment-detail__author-info-timestamp">
								{ getFormattedDate( commentDate, site ) }
							</div>
						</div>
						<AutoDirection>
							<div className="comment-detail__comment-preview">
								<Emojify>{ decodeEntities( stripHTML( commentContent ) ) }</Emojify>
							</div>
						</AutoDirection>
					</div>
				) }

				{ ( ( isEnabled( 'comments/management/quick-actions' ) &&
					showQuickActions &&
					! viewport.isMobile() ) ||
					isExpanded ) &&
				! isEditMode && (
					<CommentDetailActions
						compact={ showQuickActions && ! isExpanded }
						commentIsLiked={ commentIsLiked }
						commentStatus={ commentStatus }
						deleteCommentPermanently={ deleteCommentPermanently }
						toggleReply={ toggleReply }
						toggleApprove={ toggleApprove }
						toggleEditMode={ toggleEditMode }
						toggleLike={ toggleLike }
						toggleSpam={ toggleSpam }
						toggleTrash={ toggleTrash }
					/>
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
	}
}

export default localize( CommentDetailHeader );
