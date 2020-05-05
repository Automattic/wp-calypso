/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import FormToggle from 'components/forms/form-toggle/compact';
import * as postUtils from 'state/posts/utils';
import InfoPopover from 'components/info-popover';
import { recordEditorStat, recordEditorEvent } from 'state/posts/stats';
import { editPost } from 'state/posts/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPost, getSitePost } from 'state/posts/selectors';
import EditorPublishDate from 'post-editor/editor-publish-date';
import EditorVisibility from 'post-editor/editor-visibility';
import canCurrentUser from 'state/selectors/can-current-user';

/**
 * Style dependencies
 */
import './style.scss';

export class EditPostStatus extends Component {
	static propTypes = {
		setPostDate: PropTypes.func,
		onSave: PropTypes.func,
		post: PropTypes.object,
		currentPost: PropTypes.object,
		translate: PropTypes.func,
		onPrivatePublish: PropTypes.func,
		confirmationSidebarStatus: PropTypes.string,
	};

	toggleStickyStatus = () => {
		let stickyStat, stickyEventLabel;

		if ( ! this.props.post.sticky ) {
			stickyStat = 'advanced_sticky_enabled';
			stickyEventLabel = 'On';
		} else {
			stickyStat = 'advanced_sticky_disabled';
			stickyEventLabel = 'Off';
		}

		this.props.recordEditorStat( stickyStat );
		this.props.recordEditorEvent( 'Changed Sticky Setting', stickyEventLabel );

		this.props.editPost( this.props.siteId, this.props.postId, {
			sticky: ! this.props.post.sticky,
		} );
	};

	togglePendingStatus = () => {
		const pending = this.props.post.status === 'pending';

		this.props.recordEditorStat( 'status_changed' );
		this.props.recordEditorEvent(
			'Changed Pending Status',
			pending ? 'Marked Draft' : 'Marked Pending'
		);

		this.props.editPost( this.props.siteId, this.props.postId, {
			status: pending ? 'draft' : 'pending',
		} );
	};

	revertToDraft = () => {
		this.props.onSave( 'draft' );
	};

	render() {
		const { translate, canUserPublishPosts, post, currentPost } = this.props;

		const isPending = postUtils.isPending( post );
		const isPrivate = postUtils.isPrivate( post );
		const isPasswordProtected = postUtils.getVisibility( post ) === 'password';
		const isPublished = postUtils.isPublished( currentPost );
		const isScheduled = postUtils.isScheduled( currentPost );

		const showSticky = post && post.type === 'post' && ! isPrivate && ! isPasswordProtected;
		const showPending = post && ! isPublished && ! isScheduled && canUserPublishPosts;
		const showRevertToDraft = isPublished || isScheduled || ( isPending && ! canUserPublishPosts );

		return (
			<div className="edit-post-status">
				{ this.renderPostScheduling() }
				{ this.renderPostVisibility() }
				{ showSticky && (
					<label className="edit-post-status__sticky">
						<span className="edit-post-status__label-text">
							{ translate( 'Stick to the top of the blog' ) }
							<InfoPopover position="top right" gaEventCategory="Editor" popoverName="Sticky Post">
								{ translate( 'Sticky posts will appear at the top of your posts page.' ) }
							</InfoPopover>
						</span>
						<FormToggle
							checked={ post.sticky }
							onChange={ this.toggleStickyStatus }
							aria-label={ translate( 'Stick post to the front page' ) }
						/>
					</label>
				) }
				{ showPending && (
					<label className="edit-post-status__pending-review">
						<span className="edit-post-status__label-text">
							{ translate( 'Pending review' ) }
							<InfoPopover position="top right">
								{ translate( 'Flag this post to be reviewed for approval.' ) }
							</InfoPopover>
						</span>
						<FormToggle
							checked={ isPending }
							onChange={ this.togglePendingStatus }
							aria-label={ translate( 'Request review for post' ) }
						/>
					</label>
				) }
				{ showRevertToDraft && (
					<Button
						className="edit-post-status__revert-to-draft"
						onClick={ this.revertToDraft }
						compact={ true }
					>
						<Gridicon icon="undo" size={ 18 } /> { translate( 'Revert to draft' ) }
					</Button>
				) }
			</div>
		);
	}

	renderPostScheduling() {
		return <EditorPublishDate post={ this.props.post } setPostDate={ this.props.setPostDate } />;
	}

	renderPostVisibility() {
		// Do not render the editor visibility component on both the editor sidebar and the confirmation sidebar
		// at the same time so that it is predictable which one gets the focus / shows the validation error message.
		if ( 'open' === this.props.confirmationSidebarStatus ) {
			return;
		}

		return (
			<EditorVisibility onPrivatePublish={ this.props.onPrivatePublish } context="post-settings" />
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const post = getEditedPost( state, siteId, postId );
		const currentPost = getSitePost( state, siteId, postId );
		const canUserPublishPosts = canCurrentUser( state, siteId, 'publish_posts' );

		return {
			siteId,
			postId,
			post,
			currentPost,
			canUserPublishPosts,
		};
	},
	{ editPost, recordEditorStat, recordEditorEvent }
)( localize( EditPostStatus ) );
